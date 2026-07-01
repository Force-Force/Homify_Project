"""
Billing business rules — quotas, boosts, subscriptions.
"""
import threading
import time
import uuid
from datetime import timedelta

from django.conf import settings
from django.db.models import Case, IntegerField, Q, Value, When
from django.utils import timezone

from apps.core.exceptions import BusinessLogicError
from apps.properties.models import Property

from .aangaraapay import AangaraaPayClient, AangaraaPayError, map_webhook_status
from .models import BillingProduct, LandlordSubscription, PaymentOrder


class BillingError(BusinessLogicError):
    """Billing / monetization rule violation."""


ACTIVE_LISTING_STATUSES = frozenset({'DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED'})


class BillingService:
    """Landlord monetization: plans, boosts, orders."""

    FREE_MAX_LISTINGS = getattr(settings, 'HOMIFY_FREE_PLAN_MAX_LISTINGS', 2)

    @classmethod
    def get_free_max_listings(cls):
        return cls.FREE_MAX_LISTINGS

    @classmethod
    def mock_payments_enabled(cls):
        return getattr(settings, 'BILLING_MOCK_PAYMENTS', True)

    @classmethod
    def aangaraapay_enabled(cls):
        if cls.mock_payments_enabled():
            return False
        return bool(getattr(settings, 'AANGARAAPAY_APP_KEY', ''))

    @classmethod
    def get_notify_url(cls) -> str:
        base = getattr(settings, 'BACKEND_PUBLIC_URL', 'http://localhost:8000').rstrip('/')
        return f'{base}/api/billing/webhook/aangaraapay/'

    @classmethod
    def get_return_url(cls, order_id: int) -> str:
        frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        return f'{frontend}/landlord/billing/return?order_id={order_id}'

    @classmethod
    def get_active_products(cls):
        return BillingProduct.objects.filter(is_active=True).order_by('sort_order', 'amount_fcfa')

    @classmethod
    def get_product(cls, code: str) -> BillingProduct:
        try:
            return BillingProduct.objects.get(code=code, is_active=True)
        except BillingProduct.DoesNotExist as exc:
            raise BillingError(
                f'Produit « {code} » introuvable ou inactif.',
                code='product_not_found',
            ) from exc

    @classmethod
    def get_active_subscription(cls, user) -> LandlordSubscription | None:
        if not user.is_authenticated:
            return None
        now = timezone.now()
        return (
            LandlordSubscription.objects.filter(
                user=user,
                is_active=True,
                plan_code='PRO',
            )
            .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))
            .order_by('-expires_at')
            .first()
        )

    @classmethod
    def is_pro_landlord(cls, user) -> bool:
        if not user.is_authenticated:
            return False
        if user.role == 'ADMIN':
            return True
        return cls.get_active_subscription(user) is not None

    @classmethod
    def count_active_listings(cls, user) -> int:
        return Property.objects.filter(
            landlord=user,
            status__in=ACTIVE_LISTING_STATUSES,
        ).count()

    @classmethod
    def can_create_listing(cls, user) -> tuple[bool, str | None]:
        if user.role == 'ADMIN':
            return True, None
        if user.role != 'LANDLORD':
            return False, 'Seuls les propriétaires peuvent créer des annonces.'
        if cls.is_pro_landlord(user):
            return True, None
        count = cls.count_active_listings(user)
        if count >= cls.FREE_MAX_LISTINGS:
            return False, (
                f'Plan gratuit : maximum {cls.FREE_MAX_LISTINGS} annonces actives. '
                'Passez au plan Pro pour publier sans limite.'
            )
        return True, None

    @classmethod
    def ensure_can_create_listing(cls, user):
        allowed, message = cls.can_create_listing(user)
        if not allowed:
            raise BillingError(message or 'Quota annonces atteint.', code='listing_quota_exceeded')

    @classmethod
    def get_billing_summary(cls, user) -> dict:
        sub = cls.get_active_subscription(user)
        is_pro = cls.is_pro_landlord(user)
        active_listings = cls.count_active_listings(user)
        max_listings = None if is_pro else cls.FREE_MAX_LISTINGS
        boosted_count = Property.objects.filter(
            landlord=user,
            boost_until__gt=timezone.now(),
        ).count()
        return {
            'plan_code': 'PRO' if is_pro else 'FREE',
            'is_pro': is_pro,
            'subscription_expires_at': sub.expires_at.isoformat() if sub and sub.expires_at else None,
            'active_listings_count': active_listings,
            'max_listings': max_listings,
            'can_create_listing': cls.can_create_listing(user)[0],
            'boosted_listings_count': boosted_count,
            'mock_payments': cls.mock_payments_enabled(),
            'payment_provider': 'MOCK' if cls.mock_payments_enabled() else 'AANGARAAPAY',
        }

    @classmethod
    def apply_boost_ordering(cls, queryset):
        """Boosted published listings first, then newest."""
        now = timezone.now()
        return queryset.annotate(
            _boost_rank=Case(
                When(boost_until__gt=now, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            ),
        ).order_by('_boost_rank', '-created_at')

    @classmethod
    def _ensure_property_boostable(cls, user, property_obj: Property):
        if property_obj.landlord_id != user.id and user.role != 'ADMIN':
            raise BillingError('Cette annonce ne vous appartient pas.', code='not_property_owner')
        if property_obj.status != 'PUBLISHED':
            raise BillingError(
                'Seules les annonces publiées peuvent être boostées.',
                code='property_not_published',
            )

    @classmethod
    def _generate_transaction_id(cls) -> str:
        return f'homify-{uuid.uuid4().hex}'

    @classmethod
    def _fulfill_order(cls, order: PaymentOrder):
        if order.status == 'COMPLETED':
            return order

        product = order.product
        now = timezone.now()

        if product.product_type == 'BOOST':
            if not order.property_id:
                raise BillingError('Annonce requise pour un boost.', code='property_required')
            prop = order.property
            base = prop.boost_until if prop.boost_until and prop.boost_until > now else now
            prop.boost_until = base + timedelta(days=product.duration_days)
            prop.save(update_fields=['boost_until', 'updated_at'])

        elif product.product_type == 'SUBSCRIPTION':
            LandlordSubscription.objects.filter(user=order.user, is_active=True).update(is_active=False)
            expires = now + timedelta(days=product.duration_days) if product.duration_days else None
            LandlordSubscription.objects.create(
                user=order.user,
                plan_code='PRO',
                expires_at=expires,
                is_active=True,
            )

        order.status = 'COMPLETED'
        order.completed_at = now
        order.save(update_fields=['status', 'completed_at'])
        cls._notify_payment_success(order)
        return order

    @classmethod
    def _notify_payment_success(cls, order: PaymentOrder):
        from apps.notifications.services import NotificationDispatchService

        product = order.product
        amount = int(order.amount_fcfa)

        if product.product_type == 'BOOST':
            title = 'Boost activé'
            body = (
                f'Votre boost « {product.name} » est actif pour l\'annonce '
                f'#{order.property_id}. Montant : {amount:,} FCFA.'.replace(',', ' ')
            )
            email_subject = 'Homify — Boost activé'
            email_body = (
                f'Bonjour,\n\nVotre paiement de {amount} FCFA pour « {product.name} » '
                f'a été confirmé. Votre annonce bénéficie d\'une visibilité prioritaire.\n\n'
                f'— L\'équipe Homify'
            )
        else:
            title = 'Abonnement Pro activé'
            body = (
                f'Votre abonnement « {product.name} » est actif. '
                f'Vous pouvez publier sans limite d\'annonces. Montant : {amount:,} FCFA.'.replace(',', ' ')
            )
            email_subject = 'Homify — Abonnement Pro activé'
            email_body = (
                f'Bonjour,\n\nVotre paiement de {amount} FCFA pour « {product.name} » '
                f'a été confirmé. Votre plan Pro est maintenant actif.\n\n— L\'équipe Homify'
            )

        NotificationDispatchService.notify(
            order.user,
            'SYSTEM',
            title,
            body,
            property_obj=order.property,
            metadata={
                'payment_order_id': order.id,
                'product_code': product.code,
                'product_type': product.product_type,
            },
            email_subject=email_subject,
            email_body=email_body,
        )

    @classmethod
    def list_orders(cls, user, *, limit: int = 50):
        return (
            PaymentOrder.objects.filter(user=user)
            .select_related('product', 'property')
            .order_by('-created_at')[:limit]
        )

    @classmethod
    def _mark_order_failed(cls, order: PaymentOrder, status: str = 'FAILED'):
        order.status = status if status in ('FAILED', 'CANCELLED') else 'FAILED'
        order.save(update_fields=['status'])
        return order

    @classmethod
    def abandon_pending_order(cls, order: PaymentOrder) -> PaymentOrder:
        """USSD not confirmed in time — cancel the pending payment."""
        if order.status != 'PENDING':
            return order
        order.status = 'CANCELLED'
        order.save(update_fields=['status'])
        return order

    @classmethod
    def _poll_interval(cls) -> int:
        return max(2, int(getattr(settings, 'BILLING_PAYMENT_POLL_INTERVAL_SECONDS', 5)))

    @classmethod
    def _poll_timeout(cls) -> int:
        return max(cls._poll_interval(), int(getattr(settings, 'BILLING_PAYMENT_POLL_TIMEOUT_SECONDS', 60)))

    @classmethod
    def apply_provider_status(cls, order: PaymentOrder, provider_status: str) -> PaymentOrder:
        mapped = map_webhook_status(provider_status)
        if mapped == 'COMPLETED':
            cls._fulfill_order(order)
        elif mapped in ('FAILED', 'CANCELLED'):
            cls._mark_order_failed(order, mapped)
        return order

    @classmethod
    def run_payment_status_poll(cls, order_id: int) -> PaymentOrder | None:
        """
        Poll Aangaraa Pay and persist result in DB (no webhook required).
        Stops when payment succeeds, fails, or USSD timeout is reached.
        """
        interval = cls._poll_interval()
        deadline = time.monotonic() + cls._poll_timeout()

        while time.monotonic() < deadline:
            try:
                order = PaymentOrder.objects.select_related('product', 'property').get(pk=order_id)
            except PaymentOrder.DoesNotExist:
                return None

            if order.status != 'PENDING':
                return order

            if not order.pay_token:
                return order

            cls.sync_order_status(order)
            order.refresh_from_db()
            if order.status != 'PENDING':
                return order

            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            time.sleep(min(interval, remaining))

        try:
            order = PaymentOrder.objects.get(pk=order_id)
        except PaymentOrder.DoesNotExist:
            return None

        if order.status == 'PENDING':
            return cls.abandon_pending_order(order)
        return order

    @classmethod
    def schedule_payment_polling(cls, order_id: int):
        """Start background polling (thread in dev, Celery in prod)."""
        if getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', True):
            thread = threading.Thread(
                target=cls.run_payment_status_poll,
                args=(order_id,),
                daemon=True,
                name=f'homify-payment-poll-{order_id}',
            )
            thread.start()
            return

        from .tasks import poll_payment_order_task

        poll_payment_order_task.delay(order_id)

    @classmethod
    def _initiate_aangaraapay(cls, order: PaymentOrder, user, payment: dict) -> dict:
        client = AangaraaPayClient()
        if not client.configured:
            raise BillingError(
                'Paiement Aangaraa Pay non configuré (AANGARAAPAY_APP_KEY).',
                code='payment_not_configured',
            )

        operator = payment.get('operator') or ''
        phone_number = payment.get('phone_number') or ''
        payment_mode = payment.get('payment_mode') or 'no_redirect'
        description = f'Homify — {order.product.name}'

        notify_url = cls.get_notify_url()
        return_url = cls.get_return_url(order.pk)

        try:
            if payment_mode == 'redirect':
                result = client.initiate_redirect(
                    amount=int(order.amount_fcfa),
                    description=description,
                    transaction_id=order.transaction_id,
                    operator=operator,
                    notify_url=notify_url,
                    return_url=return_url,
                    user_name=user.get_full_name() or '',
                    user_email=user.email or '',
                    user_phone_number=phone_number,
                )
            else:
                if not phone_number:
                    raise BillingError(
                        'Numéro Mobile Money requis.',
                        code='phone_required',
                    )
                if not operator:
                    raise BillingError(
                        'Opérateur requis (MTN ou Orange).',
                        code='operator_required',
                    )
                result = client.initiate_no_redirect(
                    phone_number=phone_number,
                    amount=int(order.amount_fcfa),
                    description=description,
                    transaction_id=order.transaction_id,
                    operator=operator,
                    notify_url=notify_url,
                    return_url=return_url,
                    user_name=user.get_full_name() or '',
                    user_email=user.email or '',
                )
        except AangaraaPayError as exc:
            order.status = 'FAILED'
            order.save(update_fields=['status'])
            raise BillingError(
                exc.message or 'Échec initiation paiement.',
                code='payment_init_failed',
            ) from exc

        order.provider = 'AANGARAAPAY'
        order.operator = operator
        order.pay_token = result.pay_token or ''
        order.save(update_fields=['provider', 'operator', 'pay_token'])

        return {
            'mode': payment_mode,
            'status': result.status,
            'payment_url': result.payment_url,
            'message': 'Confirmez le paiement sur votre téléphone.',
        }

    @classmethod
    def create_order(
        cls,
        user,
        product_code: str,
        property_id: int | None = None,
        *,
        payment: dict | None = None,
    ) -> tuple[PaymentOrder, dict | None]:
        if user.role not in ('LANDLORD', 'ADMIN'):
            raise BillingError('Réservé aux propriétaires.', code='landlord_only')

        product = cls.get_product(product_code)
        property_obj = None

        if product.product_type == 'BOOST':
            if not property_id:
                raise BillingError('property_id requis pour un boost.', code='property_required')
            try:
                property_obj = Property.objects.get(pk=property_id)
            except Property.DoesNotExist as exc:
                raise BillingError('Annonce introuvable.', code='property_not_found') from exc
            cls._ensure_property_boostable(user, property_obj)

        order = PaymentOrder.objects.create(
            user=user,
            product=product,
            property=property_obj,
            amount_fcfa=product.amount_fcfa,
            status='PENDING',
            provider='MOCK' if cls.mock_payments_enabled() else 'AANGARAAPAY',
            transaction_id=cls._generate_transaction_id(),
        )

        payment_info = None

        if cls.mock_payments_enabled():
            order.provider_reference = f'MOCK-{order.pk}'
            order.save(update_fields=['provider_reference'])
            cls._fulfill_order(order)
        else:
            payment_info = cls._initiate_aangaraapay(order, user, payment or {})
            if order.status == 'PENDING' and order.pay_token:
                cls.schedule_payment_polling(order.pk)

        return order, payment_info

    @classmethod
    def get_order_for_user(cls, user, order_id: int) -> PaymentOrder:
        try:
            order = PaymentOrder.objects.select_related('product', 'property').get(pk=order_id, user=user)
        except PaymentOrder.DoesNotExist as exc:
            raise BillingError('Commande introuvable.', code='order_not_found') from exc
        return order

    @classmethod
    def sync_order_status(cls, order: PaymentOrder) -> PaymentOrder:
        """Single check against Aangaraa Pay → update order in DB."""
        if order.status != 'PENDING' or not order.pay_token:
            return order

        client = AangaraaPayClient()
        try:
            result = client.check_status(order.pay_token)
        except AangaraaPayError:
            return order

        return cls.apply_provider_status(order, result.status)

    @classmethod
    def handle_webhook(cls, payload: dict) -> PaymentOrder | None:
        transaction_id = payload.get('transaction_id') or payload.get('transactionId')
        if not transaction_id:
            return None

        try:
            order = PaymentOrder.objects.select_related('product', 'property').get(
                transaction_id=transaction_id,
            )
        except PaymentOrder.DoesNotExist:
            return None

        if payload.get('paytoken') and not order.pay_token:
            order.pay_token = payload['paytoken']
            order.save(update_fields=['pay_token'])

        if payload.get('txnid'):
            order.provider_reference = payload['txnid']
            order.save(update_fields=['provider_reference'])

        return cls.apply_provider_status(order, payload.get('status', ''))

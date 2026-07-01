"""Billing tests — quotas, mock payments, polling, notifications."""
from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.billing.aangaraapay import PaymentInitResult, PaymentStatusResult
from apps.billing.models import BillingProduct, LandlordSubscription, PaymentOrder, RentCommission
from apps.billing.services import BillingService
from apps.notifications.models import Notification
from apps.properties.models import Address, Property

User = get_user_model()

PROPERTY_PAYLOAD = {
    'title': 'Appart test',
    'description': 'Description de test avec plus de cinquante caractères minimum requis.',
    'type': 'APARTMENT',
    'surface': 50,
    'number_of_rooms': 2,
    'number_of_bedrooms': 1,
    'number_of_bathrooms': 1,
    'furnished': True,
    'monthly_rent': '200000',
    'charges': '0',
    'charges_included': False,
    'deposit': '400000',
    'agency_fees': '0',
    'address': {
        'street_address': 'Rue Test',
        'city': 'Yaoundé',
        'postal_code': '00237',
        'district': 'Bastos',
    },
}


@override_settings(BILLING_MOCK_PAYMENTS=True, HOMIFY_FREE_PLAN_MAX_LISTINGS=2)
class BillingQuotaTests(APITestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            email='landlord-billing@test.cm',
            password='SecurePass1!',
            first_name='Paul',
            last_name='Owner',
            role='LANDLORD',
            email_verified=True,
        )
        self.client.force_authenticate(user=self.landlord)
        BillingProduct.objects.get_or_create(
            code='PLAN_PRO_MONTHLY',
            defaults={
                'name': 'Pro',
                'product_type': 'SUBSCRIPTION',
                'amount_fcfa': 15000,
                'duration_days': 30,
                'is_active': True,
            },
        )

    def _create_listing(self, title='Annonce'):
        payload = {**PROPERTY_PAYLOAD, 'title': title}
        return self.client.post('/api/properties/', payload, format='json')

    def test_free_plan_blocks_third_listing(self):
        self.assertEqual(self._create_listing('A1').status_code, status.HTTP_201_CREATED)
        self.assertEqual(self._create_listing('A2').status_code, status.HTTP_201_CREATED)
        response = self._create_listing('A3')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('code'), 'listing_quota_exceeded')

    def test_pro_plan_allows_unlimited_listings(self):
        LandlordSubscription.objects.create(
            user=self.landlord,
            plan_code='PRO',
            is_active=True,
            expires_at=timezone.now() + timezone.timedelta(days=30),
        )
        for i in range(3):
            response = self._create_listing(f'Pro {i}')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)


@override_settings(
    BILLING_MOCK_PAYMENTS=True,
    CELERY_TASK_ALWAYS_EAGER=True,
)
class BillingMockPaymentTests(TestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            email='pay-landlord@test.cm',
            password='SecurePass1!',
            role='LANDLORD',
            email_verified=True,
        )
        self.boost_product = BillingProduct.objects.create(
            code='BOOST_7D',
            name='Boost 7j',
            product_type='BOOST',
            amount_fcfa=5000,
            duration_days=7,
            is_active=True,
        )
        self.sub_product = BillingProduct.objects.create(
            code='PLAN_PRO_MONTHLY',
            name='Pro 1 mois',
            product_type='SUBSCRIPTION',
            amount_fcfa=15000,
            duration_days=30,
            is_active=True,
        )
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='Studio',
            description='Test',
            type='STUDIO',
            surface=30,
            number_of_rooms=1,
            number_of_bedrooms=1,
            number_of_bathrooms=1,
            monthly_rent=Decimal('150000'),
            status='PUBLISHED',
        )
        Address.objects.create(
            property=self.property,
            street_address='Rue 1',
            city='Douala',
            postal_code='00237',
            district='Akwa',
        )

    def test_mock_boost_fulfills_and_notifies(self):
        order, _ = BillingService.create_order(
            self.landlord,
            'BOOST_7D',
            property_id=self.property.id,
        )
        self.assertEqual(order.status, 'COMPLETED')
        self.property.refresh_from_db()
        self.assertIsNotNone(self.property.boost_until)
        self.assertEqual(Notification.objects.filter(user=self.landlord).count(), 1)
        notif = Notification.objects.get(user=self.landlord)
        self.assertIn('Boost', notif.title)

    def test_mock_subscription_activates_pro(self):
        order, _ = BillingService.create_order(self.landlord, 'PLAN_PRO_MONTHLY')
        self.assertEqual(order.status, 'COMPLETED')
        summary = BillingService.get_billing_summary(self.landlord)
        self.assertTrue(summary['is_pro'])
        self.assertEqual(Notification.objects.filter(user=self.landlord).count(), 1)


@override_settings(
    BILLING_MOCK_PAYMENTS=False,
    AANGARAAPAY_APP_KEY='test-key',
    BILLING_PAYMENT_POLL_INTERVAL_SECONDS=1,
    BILLING_PAYMENT_POLL_TIMEOUT_SECONDS=2,
    CELERY_TASK_ALWAYS_EAGER=True,
)
class BillingPollTests(TestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            email='poll-landlord@test.cm',
            password='SecurePass1!',
            role='LANDLORD',
            email_verified=True,
        )
        BillingProduct.objects.create(
            code='BOOST_7D',
            name='Boost',
            product_type='BOOST',
            amount_fcfa=5000,
            duration_days=7,
            is_active=True,
        )
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='Studio',
            description='Test',
            type='STUDIO',
            surface=30,
            number_of_rooms=1,
            number_of_bedrooms=1,
            number_of_bathrooms=1,
            monthly_rent=Decimal('150000'),
            status='PUBLISHED',
        )

    @patch('apps.billing.services.BillingService.schedule_payment_polling')
    @patch('apps.billing.services.AangaraaPayClient')
    @patch('apps.billing.services.time.sleep')
    def test_poll_abandons_pending_after_timeout(self, mock_sleep, mock_client_cls, mock_schedule):
        mock_client = mock_client_cls.return_value
        mock_client.configured = True
        mock_client.initiate_no_redirect.return_value = PaymentInitResult(
            transaction_id='tx-1',
            pay_token='token-abc',
            status='PENDING',
            payment_url=None,
            raw={},
        )
        mock_client.check_status.return_value = PaymentStatusResult(
            status='PENDING',
            transaction_id='tx-1',
            pay_token='token-abc',
            amount=5000,
            raw={},
        )

        order, _ = BillingService.create_order(
            self.landlord,
            'BOOST_7D',
            property_id=self.property.id,
            payment={
                'phone_number': '655123456',
                'operator': 'MTN_Cameroon',
                'payment_mode': 'no_redirect',
            },
        )
        self.assertEqual(order.status, 'PENDING')

        result = BillingService.run_payment_status_poll(order.pk)
        self.assertEqual(result.status, 'CANCELLED')

    @patch('apps.billing.services.AangaraaPayClient')
    def test_poll_completes_on_successful_status(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        mock_client.configured = True
        mock_client.initiate_no_redirect.return_value = PaymentInitResult(
            transaction_id='tx-2',
            pay_token='token-xyz',
            status='PENDING',
            payment_url=None,
            raw={},
        )
        mock_client.check_status.return_value = PaymentStatusResult(
            status='SUCCESSFUL',
            transaction_id='tx-2',
            pay_token='token-xyz',
            amount=5000,
            raw={},
        )

        order = PaymentOrder.objects.create(
            user=self.landlord,
            product=BillingProduct.objects.get(code='BOOST_7D'),
            property=self.property,
            amount_fcfa=5000,
            status='PENDING',
            provider='AANGARAAPAY',
            transaction_id='homify-test-tx',
            pay_token='token-xyz',
        )

        BillingService.sync_order_status(order)
        order.refresh_from_db()
        self.assertEqual(order.status, 'COMPLETED')
        self.assertEqual(Notification.objects.filter(user=self.landlord).count(), 1)


@override_settings(BILLING_MOCK_PAYMENTS=True)
class BillingApiTests(APITestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            email='api-landlord@test.cm',
            password='SecurePass1!',
            role='LANDLORD',
            email_verified=True,
        )
        self.client.force_authenticate(user=self.landlord)
        BillingProduct.objects.create(
            code='PLAN_PRO_MONTHLY',
            name='Pro',
            product_type='SUBSCRIPTION',
            amount_fcfa=15000,
            duration_days=30,
            is_active=True,
        )

    def test_orders_list_returns_history(self):
        BillingService.create_order(self.landlord, 'PLAN_PRO_MONTHLY')
        response = self.client.get('/api/billing/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'COMPLETED')

    def test_billing_me_includes_mock_flag(self):
        response = self.client.get('/api/billing/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['mock_payments'])


@override_settings(BILLING_MOCK_PAYMENTS=True, HOMIFY_RENT_COMMISSION_PERCENT=5)
class BillingStatsAndCommissionTests(APITestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            email='stats-landlord@test.cm',
            password='SecurePass1!',
            role='LANDLORD',
            email_verified=True,
        )
        self.client.force_authenticate(user=self.landlord)
        self.property = Property.objects.create(
            landlord=self.landlord,
            title='Studio stats',
            description='Test property for stats',
            type='STUDIO',
            surface=30,
            number_of_rooms=1,
            number_of_bedrooms=1,
            number_of_bathrooms=1,
            monthly_rent=Decimal('200000'),
            status='PUBLISHED',
            view_count=12,
        )
        Address.objects.create(
            property=self.property,
            street_address='Rue 1',
            city='Douala',
            postal_code='00237',
            district='Akwa',
        )

    def test_stats_requires_pro_plan(self):
        response = self.client.get('/api/billing/stats/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data.get('code'), 'pro_required')

    def test_stats_returns_metrics_for_pro_landlord(self):
        LandlordSubscription.objects.create(
            user=self.landlord,
            plan_code='PRO',
            is_active=True,
            expires_at=timezone.now() + timezone.timedelta(days=30),
        )
        response = self.client.get('/api/billing/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_pro'])
        self.assertEqual(response.data['totals']['views'], 12)
        self.assertEqual(len(response.data['properties']), 1)
        self.assertEqual(response.data['properties'][0]['title'], 'Studio stats')

    def test_mark_rented_records_commission_when_via_homify(self):
        response = self.client.post(
            f'/api/properties/{self.property.id}/mark_rented/',
            {'rented_via_homify': True},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('commission', response.data)
        self.assertEqual(response.data['commission']['amount_fcfa'], '10000')
        self.assertEqual(RentCommission.objects.filter(landlord=self.landlord).count(), 1)

        commissions = self.client.get('/api/billing/commissions/')
        self.assertEqual(commissions.status_code, status.HTTP_200_OK)
        self.assertEqual(len(commissions.data), 1)
        self.assertEqual(commissions.data[0]['property_title'], 'Studio stats')

    def test_mark_rented_skips_commission_outside_homify(self):
        response = self.client.post(
            f'/api/properties/{self.property.id}/mark_rented/',
            {'rented_via_homify': False},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('commission', response.data)
        self.assertEqual(RentCommission.objects.count(), 0)


class LandlordVerificationApiTests(APITestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            email='kyc-landlord@test.cm',
            password='SecurePass1!',
            role='LANDLORD',
            email_verified=True,
        )
        self.admin = User.objects.create_user(
            email='kyc-admin@test.cm',
            password='SecurePass1!',
            role='ADMIN',
            email_verified=True,
        )

    def test_landlord_can_submit_verification_request(self):
        self.client.force_authenticate(user=self.landlord)
        response = self.client.post(
            '/api/auth/me/landlord-verification/',
            {'id_number': 'CI-12345', 'note': 'Carte nationale'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['request']['status'], 'PENDING')

    def test_admin_can_approve_verification(self):
        from apps.users.models import LandlordVerificationRequest

        req = LandlordVerificationRequest.objects.create(
            user=self.landlord,
            id_number='CI-999',
            status='PENDING',
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f'/api/auth/admin/landlord-verifications/{req.id}/approve/',
            {'admin_note': 'OK'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.landlord.refresh_from_db()
        self.assertTrue(self.landlord.landlord_verified)

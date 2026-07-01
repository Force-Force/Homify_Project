"""Landlord KYC verification workflow."""
from django.utils import timezone

from apps.core.exceptions import BusinessLogicError
from apps.notifications.services import NotificationDispatchService

from .models import LandlordVerificationRequest, User


class VerificationError(BusinessLogicError):
    """KYC verification rule violation."""


class LandlordVerificationService:
    @classmethod
    def get_latest_request(cls, user) -> LandlordVerificationRequest | None:
        return (
            LandlordVerificationRequest.objects.filter(user=user)
            .order_by('-created_at')
            .first()
        )

    @classmethod
    def submit(cls, user, *, id_number: str = '', note: str = '') -> LandlordVerificationRequest:
        if user.role not in ('LANDLORD', 'ADMIN'):
            raise VerificationError('Réservé aux propriétaires.', code='landlord_only')
        if user.landlord_verified:
            raise VerificationError('Compte déjà vérifié.', code='already_verified')

        pending = LandlordVerificationRequest.objects.filter(user=user, status='PENDING').first()
        if pending:
            raise VerificationError(
                'Une demande est déjà en cours d\'examen.',
                code='verification_pending',
            )

        return LandlordVerificationRequest.objects.create(
            user=user,
            id_number=(id_number or '').strip(),
            note=(note or '').strip(),
            status='PENDING',
        )

    @classmethod
    def approve(cls, request_obj: LandlordVerificationRequest, admin_user, admin_note: str = ''):
        if request_obj.status != 'PENDING':
            raise VerificationError('Demande déjà traitée.', code='already_reviewed')

        now = timezone.now()
        request_obj.status = 'APPROVED'
        request_obj.admin_note = admin_note
        request_obj.reviewed_by = admin_user
        request_obj.reviewed_at = now
        request_obj.save()

        user = request_obj.user
        user.landlord_verified = True
        user.landlord_verified_at = now
        user.save(update_fields=['landlord_verified', 'landlord_verified_at', 'updated_at'])

        NotificationDispatchService.notify(
            user,
            'SYSTEM',
            'Compte propriétaire vérifié',
            'Votre identité a été vérifiée. Le badge « Propriétaire vérifié » est visible sur vos annonces.',
            email_subject='Homify — Compte propriétaire vérifié',
            email_body=(
                'Bonjour,\n\nVotre demande de vérification propriétaire a été approuvée.\n\n'
                '— L\'équipe Homify'
            ),
        )
        return request_obj

    @classmethod
    def reject(cls, request_obj: LandlordVerificationRequest, admin_user, admin_note: str = ''):
        if request_obj.status != 'PENDING':
            raise VerificationError('Demande déjà traitée.', code='already_reviewed')

        request_obj.status = 'REJECTED'
        request_obj.admin_note = admin_note
        request_obj.reviewed_by = admin_user
        request_obj.reviewed_at = timezone.now()
        request_obj.save()

        NotificationDispatchService.notify(
            request_obj.user,
            'SYSTEM',
            'Vérification refusée',
            admin_note or 'Votre demande de vérification n\'a pas pu être acceptée. Vous pouvez soumettre une nouvelle demande.',
            email_subject='Homify — Vérification propriétaire',
            email_body=(
                f'Bonjour,\n\nVotre demande de vérification a été refusée.\n'
                f'{admin_note}\n\n— L\'équipe Homify'
            ),
        )
        return request_obj

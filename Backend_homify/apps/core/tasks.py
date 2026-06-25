"""
Celery async tasks: emails, thumbnails, notifications.
"""
import io
import logging

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, subject, message, recipient_email):
    """Send an email asynchronously."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@homify.cm'),
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info('Email sent to %s: %s', recipient_email, subject)
    except Exception as exc:
        logger.exception('Failed to send email to %s', recipient_email)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def generate_photo_thumbnail_task(self, photo_id):
    """Generate a thumbnail for a property photo using Pillow."""
    from PIL import Image
    from apps.properties.models import Photo

    try:
        photo = Photo.objects.select_related('property').get(id=photo_id)
    except Photo.DoesNotExist:
        logger.warning('Photo %s not found for thumbnail generation', photo_id)
        return

    if not photo.image:
        return

    try:
        thumb_size = getattr(settings, 'HOMIFY_THUMBNAIL_SIZE', (400, 400))
        with photo.image.open('rb') as image_file:
            img = Image.open(image_file)
            img = img.convert('RGB')
            img.thumbnail(thumb_size, Image.Resampling.LANCZOS)

            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            buffer.seek(0)

            base_name = photo.image.name.rsplit('/', 1)[-1]
            thumb_name = f'thumb_{base_name.rsplit(".", 1)[0]}.jpg'
            photo.thumbnail.save(thumb_name, buffer, save=True)

        logger.info('Thumbnail generated for photo %s', photo_id)
    except Exception as exc:
        logger.exception('Thumbnail generation failed for photo %s', photo_id)
        raise self.retry(exc=exc)


@shared_task
def notify_property_rejected_task(property_id, reason=''):
    """Notify landlord when their property is rejected."""
    from apps.notifications.services import NotificationDispatchService
    from apps.properties.models import Property

    try:
        prop = Property.objects.select_related('landlord').get(id=property_id)
    except Property.DoesNotExist:
        return

    landlord = prop.landlord
    title = 'Annonce rejetée'
    body = f'Votre annonce « {prop.title} » a été rejetée.'
    if reason:
        body += f' Motif : {reason}'
    email_body = (
        f"Bonjour {landlord.first_name},\n\n"
        f"Votre annonce « {prop.title} » a été rejetée.\n"
    )
    if reason:
        email_body += f"\nMotif : {reason}\n"
    email_body += "\nVous pouvez la modifier et la resoumettre depuis votre espace propriétaire.\n\n— L'équipe Homify"

    NotificationDispatchService.notify(
        landlord,
        'PROPERTY_REJECTED',
        title,
        body,
        property_obj=prop,
        metadata={'action_path': f'/property/{prop.id}/edit', 'reason': reason},
        email_subject='Homify — Annonce rejetée',
        email_body=email_body,
    )


@shared_task
def notify_property_approved_task(property_id):
    """Notify landlord when property is approved (awaiting publish)."""
    from apps.notifications.services import NotificationDispatchService
    from apps.properties.models import Property

    try:
        prop = Property.objects.select_related('landlord').get(id=property_id)
    except Property.DoesNotExist:
        return

    landlord = prop.landlord
    title = 'Annonce approuvée'
    body = f'« {prop.title} » a été approuvée et sera publiée prochainement.'
    email_body = (
        f"Bonjour {landlord.first_name},\n\n"
        f"Votre annonce « {prop.title} » a été approuvée par notre équipe.\n"
        f"Elle sera publiée prochainement sur la plateforme.\n\n— L'équipe Homify"
    )

    NotificationDispatchService.notify(
        landlord,
        'PROPERTY_APPROVED',
        title,
        body,
        property_obj=prop,
        metadata={'action_path': '/my-properties'},
        email_subject='Homify — Annonce approuvée',
        email_body=email_body,
    )


@shared_task
def notify_property_published_task(property_id):
    """Notify landlord when property goes live."""
    from apps.notifications.services import NotificationDispatchService
    from apps.properties.models import Property

    try:
        prop = Property.objects.select_related('landlord').get(id=property_id)
    except Property.DoesNotExist:
        return

    landlord = prop.landlord
    title = 'Annonce publiée'
    body = f'« {prop.title} » est maintenant en ligne sur Homify.'
    email_body = (
        f"Bonjour {landlord.first_name},\n\n"
        f"Votre annonce « {prop.title} » est maintenant en ligne sur Homify !\n\n— L'équipe Homify"
    )

    NotificationDispatchService.notify(
        landlord,
        'PROPERTY_PUBLISHED',
        title,
        body,
        property_obj=prop,
        metadata={'action_path': f'/property/{prop.id}'},
        email_subject='Homify — Annonce publiée',
        email_body=email_body,
    )


@shared_task
def notify_new_message_task(message_id):
    """Notify recipient of a new message."""
    from apps.notifications.services import NotificationDispatchService
    from apps.chat.models import Message

    try:
        message = Message.objects.select_related('recipient', 'sender', 'property').get(id=message_id)
    except Message.DoesNotExist:
        return

    recipient = message.recipient
    title = 'Nouveau message'
    body = (
        f'{message.sender.get_full_name()} vous a écrit concernant « {message.property.title} ».'
    )
    email_body = (
        f"Bonjour {recipient.first_name},\n\n"
        f"Vous avez reçu un nouveau message de {message.sender.get_full_name()} "
        f"concernant « {message.property.title} ».\n\n"
        f"Sujet : {message.subject}\n\n"
        f"Connectez-vous à Homify pour répondre.\n\n— L'équipe Homify"
    )

    NotificationDispatchService.notify(
        recipient,
        'MESSAGE',
        title,
        body,
        property_obj=message.property,
        message_obj=message,
        metadata={'action_path': f'/property/{message.property_id}/chat'},
        email_subject=f'Homify — Nouveau message : {message.subject}',
        email_body=email_body,
    )


@shared_task
def send_verification_email_task(user_id, token):
    from apps.users.models import User

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    verify_url = f"{frontend}/verify-email?token={token}"
    body = (
        f"Bonjour {user.first_name},\n\n"
        f"Bienvenue sur Homify ! Vérifiez votre adresse email en cliquant sur le lien ci-dessous :\n\n"
        f"{verify_url}\n\n"
        f"Ce lien expire dans 24 heures.\n\n— L'équipe Homify"
    )
    send_email_task.delay(
        'Homify — Vérifiez votre email',
        body,
        user.email,
    )


@shared_task
def send_password_reset_email_task(user_id, token):
    from apps.users.models import User

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend}/Reset-passode?token={token}"
    body = (
        f"Bonjour {user.first_name},\n\n"
        f"Vous avez demandé une réinitialisation de mot de passe.\n\n"
        f"{reset_url}\n\n"
        f"Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n"
        f"— L'équipe Homify"
    )
    send_email_task.delay(
        'Homify — Réinitialisation du mot de passe',
        body,
        user.email,
    )

"""
Property photo upload validation and thumbnail orchestration.
"""
from django.conf import settings

from apps.core.exceptions import PropertyMediaError


class PropertyMediaService:
    """Validates photo uploads per API contract (3–10 photos, 5 Mo, JPG/PNG)."""

    ALLOWED_CONTENT_TYPES = frozenset({'image/jpeg', 'image/png', 'image/jpg'})
    ALLOWED_EXTENSIONS = frozenset({'.jpg', '.jpeg', '.png'})

    @classmethod
    def _limits(cls):
        return {
            'min_per_upload': getattr(settings, 'HOMIFY_MIN_PHOTOS_PER_UPLOAD', 3),
            'max_per_upload': getattr(settings, 'HOMIFY_MAX_PHOTOS_PER_UPLOAD', 10),
            'max_total': getattr(settings, 'HOMIFY_MAX_PHOTOS_TOTAL', 10),
            'max_bytes': getattr(settings, 'HOMIFY_MAX_PHOTO_BYTES', 5 * 1024 * 1024),
        }

    @classmethod
    def validate_upload_batch(cls, files, existing_count=0):
        """Validate a batch of uploaded image files."""
        limits = cls._limits()
        count = len(files)

        if count == 0:
            raise PropertyMediaError('Aucune photo fournie.', code='no_photos')

        if count < limits['min_per_upload']:
            raise PropertyMediaError(
                f'Minimum {limits["min_per_upload"]} photos par upload requis.',
                code='too_few_photos',
            )

        if count > limits['max_per_upload']:
            raise PropertyMediaError(
                f'Maximum {limits["max_per_upload"]} photos par upload autorisées.',
                code='too_many_photos',
            )

        if existing_count + count > limits['max_total']:
            raise PropertyMediaError(
                f'Maximum {limits["max_total"]} photos au total par annonce '
                f'({existing_count} déjà présentes).',
                code='total_photos_exceeded',
            )

        for file in files:
            cls._validate_single_file(file, limits['max_bytes'])

    @classmethod
    def _validate_single_file(cls, file, max_bytes):
        content_type = getattr(file, 'content_type', '') or ''
        if content_type and content_type not in cls.ALLOWED_CONTENT_TYPES:
            raise PropertyMediaError(
                'Format non autorisé. Utilisez JPG ou PNG.',
                code='invalid_format',
            )

        name = getattr(file, 'name', '') or ''
        ext = ('.' + name.rsplit('.', 1)[-1].lower()) if '.' in name else ''
        if ext and ext not in cls.ALLOWED_EXTENSIONS:
            raise PropertyMediaError(
                'Extension non autorisée. Utilisez .jpg, .jpeg ou .png.',
                code='invalid_format',
            )

        size = getattr(file, 'size', 0) or 0
        if size > max_bytes:
            max_mb = max_bytes // (1024 * 1024)
            raise PropertyMediaError(
                f'Chaque photo doit faire au maximum {max_mb} Mo.',
                code='file_too_large',
            )

    @classmethod
    def schedule_thumbnail_generation(cls, photo_id):
        """Enqueue async thumbnail generation for a photo."""
        from apps.core.tasks import generate_photo_thumbnail_task
        generate_photo_thumbnail_task.delay(photo_id)

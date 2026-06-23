"""
Django settings for rental_project.
"""
from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


def _database_from_url(url: str) -> dict:
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': parsed.path.lstrip('/'),
        'USER': parsed.username or '',
        'PASSWORD': parsed.password or '',
        'HOST': parsed.hostname or 'localhost',
        'PORT': parsed.port or 5432,
    }


DATABASE_URL = os.getenv('DATABASE_URL')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    
    # Local apps
    'apps.core',
    'apps.users',
    'apps.properties',
    'apps.chat',
    'apps.favorites',
    'apps.reports',
    'apps.amenities',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'rental_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

WSGI_APPLICATION = 'rental_project.wsgi.application'

# Database — SQLite par défaut (dev local), PostgreSQL si DATABASE_URL est défini
if DATABASE_URL:
    DATABASES = {'default': _database_from_url(DATABASE_URL)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# bcrypt as documented in README (falls back to PBKDF2 if bcrypt unavailable)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]

# Homify business rules (aligned with API_DOCUMENTATION.md)
HOMIFY_MIN_PHOTOS_PER_UPLOAD = 3
HOMIFY_MAX_PHOTOS_PER_UPLOAD = 10
HOMIFY_MAX_PHOTOS_TOTAL = 10
HOMIFY_MAX_PHOTO_BYTES = 5 * 1024 * 1024  # 5 Mo
HOMIFY_THUMBNAIL_SIZE = (400, 400)
HOMIFY_MESSAGE_RATE_LIMIT = 3
HOMIFY_MESSAGE_RATE_WINDOW_HOURS = 24
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@homify.cm')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.users.authentication.HomifyJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS — origines explicites en prod via CORS_ALLOWED_ORIGINS (liste séparée par virgules)
_cors_env = os.getenv('CORS_ALLOWED_ORIGINS', '').strip()
if _cors_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in _cors_env.split(',') if origin.strip()]
elif DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# Email Configuration (for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Redis Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/0')

# Celery Configuration
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Dev local (make dev-local) : pas de Redis requis — tâches exécutées inline.
# Docker/prod : REDIS_URL=redis://redis:6379/0 + CELERY_TASK_ALWAYS_EAGER=false + worker Celery.
CELERY_TASK_ALWAYS_EAGER = os.getenv(
    'CELERY_TASK_ALWAYS_EAGER',
    'True' if DEBUG else 'False',
).lower() in ('1', 'true', 'yes')
CELERY_TASK_EAGER_PROPAGATES = CELERY_TASK_ALWAYS_EAGER

# Production hardening
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

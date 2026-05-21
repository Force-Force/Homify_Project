"""
Celery configuration for async tasks.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_project.settings')

app = Celery('rental_project')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

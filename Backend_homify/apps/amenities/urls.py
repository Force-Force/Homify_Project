"""
URL configuration for amenities app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AmenityViewSet

router = DefaultRouter()
router.register(r'', AmenityViewSet, basename='amenities')

urlpatterns = [
    path('', include(router.urls)),
]

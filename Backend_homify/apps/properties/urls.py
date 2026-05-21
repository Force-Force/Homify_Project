"""
URL configuration for properties app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, AdminPropertyViewSet

router = DefaultRouter()
router.register(r'', PropertyViewSet, basename='properties')
router.register(r'admin/properties', AdminPropertyViewSet, basename='admin-properties')

urlpatterns = [
    path('', include(router.urls)),
]

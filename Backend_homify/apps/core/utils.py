"""Helpers for mapping service-layer exceptions to DRF responses."""
from rest_framework import status
from rest_framework.response import Response

from apps.core.exceptions import BusinessLogicError


def business_error_response(exc: BusinessLogicError, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({'error': exc.message, 'code': exc.code}, status=http_status)

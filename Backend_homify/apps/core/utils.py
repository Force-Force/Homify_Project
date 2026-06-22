"""Helpers for mapping service-layer exceptions to DRF responses."""
from rest_framework import status
from rest_framework.response import Response

from apps.core.exceptions import BusinessLogicError


def business_error_response(exc: BusinessLogicError, http_status=status.HTTP_400_BAD_REQUEST):
    payload = {'error': exc.message, 'code': exc.code}
    if exc.extra:
        payload.update(exc.extra)
    return Response(payload, status=http_status)

"""
Billing API views.
"""
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import BusinessLogicError
from apps.core.utils import business_error_response
from apps.users.permissions import IsLandlordOrAdmin

from .serializers import (
    BillingProductSerializer,
    CreateBoostOrderSerializer,
    CreateSubscriptionOrderSerializer,
    PaymentOrderSerializer,
    RentCommissionSerializer,
)
from .services import BillingService
from .stats import LandlordStatsService


def _order_response_message(order, payment_info):
    if order.status == 'COMPLETED':
        return 'Paiement confirmé.'
    if payment_info and payment_info.get('payment_url'):
        return 'Redirection vers la page de paiement.'
    return payment_info.get('message') if payment_info else 'Commande créée.'


class BillingProductsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        products = BillingService.get_active_products()
        return Response(BillingProductSerializer(products, many=True).data)


class BillingMeView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def get(self, request):
        return Response(BillingService.get_billing_summary(request.user))


class BillingBoostOrderView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def post(self, request):
        serializer = CreateBoostOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        payment = {
            'phone_number': data.get('phone_number', ''),
            'operator': data.get('operator', ''),
            'payment_mode': data.get('payment_mode', 'no_redirect'),
        }
        try:
            order, payment_info = BillingService.create_order(
                request.user,
                data['product_code'],
                property_id=data['property_id'],
                payment=payment,
            )
        except BusinessLogicError as exc:
            return business_error_response(exc)

        body = {
            'message': 'Boost activé avec succès.' if order.status == 'COMPLETED' else _order_response_message(order, payment_info),
            'order': PaymentOrderSerializer(order).data,
        }
        if payment_info:
            body['payment'] = payment_info
        return Response(body, status=status.HTTP_201_CREATED)


class BillingSubscribeView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def post(self, request):
        serializer = CreateSubscriptionOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        payment = {
            'phone_number': data.get('phone_number', ''),
            'operator': data.get('operator', ''),
            'payment_mode': data.get('payment_mode', 'no_redirect'),
        }
        try:
            order, payment_info = BillingService.create_order(
                request.user,
                data['product_code'],
                payment=payment,
            )
        except BusinessLogicError as exc:
            return business_error_response(exc)

        body = {
            'message': 'Abonnement Pro activé.' if order.status == 'COMPLETED' else _order_response_message(order, payment_info),
            'order': PaymentOrderSerializer(order).data,
            'billing': BillingService.get_billing_summary(request.user),
        }
        if payment_info:
            body['payment'] = payment_info
        return Response(body, status=status.HTTP_201_CREATED)


class BillingOrderDetailView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def get(self, request, order_id):
        try:
            order = BillingService.get_order_for_user(request.user, order_id)
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({
            'order': PaymentOrderSerializer(order).data,
            'billing': BillingService.get_billing_summary(request.user),
        })


class BillingOrdersListView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def get(self, request):
        orders = BillingService.list_orders(request.user)
        return Response(PaymentOrderSerializer(orders, many=True).data)


class BillingStatsView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def get(self, request):
        try:
            return Response(LandlordStatsService.get_stats(request.user))
        except BusinessLogicError as exc:
            return business_error_response(exc, http_status=status.HTTP_403_FORBIDDEN)


class BillingCommissionsListView(APIView):
    permission_classes = (IsAuthenticated, IsLandlordOrAdmin)

    def get(self, request):
        commissions = BillingService.list_commissions(request.user)
        return Response(RentCommissionSerializer(commissions, many=True).data)


@method_decorator(csrf_exempt, name='dispatch')
class AangaraaPayWebhookView(APIView):
    """Aangaraa Pay notify_url callback."""

    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        BillingService.handle_webhook(request.data)
        return Response({'received': True})

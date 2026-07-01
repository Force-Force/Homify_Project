from django.urls import path

from .views import (
    AangaraaPayWebhookView,
    BillingBoostOrderView,
    BillingMeView,
    BillingOrderDetailView,
    BillingOrdersListView,
    BillingProductsView,
    BillingSubscribeView,
)

urlpatterns = [
    path('products/', BillingProductsView.as_view(), name='billing-products'),
    path('me/', BillingMeView.as_view(), name='billing-me'),
    path('orders/', BillingOrdersListView.as_view(), name='billing-orders-list'),
    path('boost/', BillingBoostOrderView.as_view(), name='billing-boost'),
    path('subscribe/', BillingSubscribeView.as_view(), name='billing-subscribe'),
    path('orders/<int:order_id>/', BillingOrderDetailView.as_view(), name='billing-order-detail'),
    path('webhook/aangaraapay/', AangaraaPayWebhookView.as_view(), name='billing-aangaraapay-webhook'),
]

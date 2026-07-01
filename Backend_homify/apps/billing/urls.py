from django.urls import path

from .views import (
    AangaraaPayWebhookView,
    AdminBillingOverviewView,
    BillingBoostOrderView,
    BillingCommissionsListView,
    BillingMeView,
    BillingOrderDetailView,
    BillingOrdersListView,
    BillingProductsView,
    BillingStatsView,
    BillingSubscribeView,
)

urlpatterns = [
    path('products/', BillingProductsView.as_view(), name='billing-products'),
    path('me/', BillingMeView.as_view(), name='billing-me'),
    path('orders/', BillingOrdersListView.as_view(), name='billing-orders-list'),
    path('stats/', BillingStatsView.as_view(), name='billing-stats'),
    path('commissions/', BillingCommissionsListView.as_view(), name='billing-commissions'),
    path('admin/overview/', AdminBillingOverviewView.as_view(), name='billing-admin-overview'),
    path('boost/', BillingBoostOrderView.as_view(), name='billing-boost'),
    path('subscribe/', BillingSubscribeView.as_view(), name='billing-subscribe'),
    path('orders/<int:order_id>/', BillingOrderDetailView.as_view(), name='billing-order-detail'),
    path('webhook/aangaraapay/', AangaraaPayWebhookView.as_view(), name='billing-aangaraapay-webhook'),
]

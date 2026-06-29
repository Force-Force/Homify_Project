from django.contrib import admin

from .models import BillingProduct, LandlordSubscription, PaymentOrder


@admin.register(BillingProduct)
class BillingProductAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'product_type', 'amount_fcfa', 'duration_days', 'is_active', 'sort_order')
    list_filter = ('product_type', 'is_active')
    search_fields = ('code', 'name')


@admin.register(LandlordSubscription)
class LandlordSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan_code', 'is_active', 'started_at', 'expires_at')
    list_filter = ('plan_code', 'is_active')
    raw_id_fields = ('user',)


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'property', 'amount_fcfa', 'status', 'provider', 'created_at')
    list_filter = ('status', 'provider', 'product__product_type')
    raw_id_fields = ('user', 'property')

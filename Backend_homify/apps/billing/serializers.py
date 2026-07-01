"""
Serializers for billing API.
"""
from rest_framework import serializers

from .models import BillingProduct, PaymentOrder, RentCommission


class BillingProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingProduct
        fields = (
            'code',
            'name',
            'description',
            'product_type',
            'amount_fcfa',
            'duration_days',
        )


class PaymentInitSerializer(serializers.Serializer):
    """Mobile Money payment details for Aangaraa Pay."""

    MODE_CHOICES = [
        ('no_redirect', 'Sans redirection'),
        ('redirect', 'Avec redirection'),
    ]

    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    operator = serializers.CharField(max_length=40, required=False, allow_blank=True)
    payment_mode = serializers.ChoiceField(choices=MODE_CHOICES, default='no_redirect')


class PaymentOrderSerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(source='product.code', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PaymentOrder
        fields = (
            'id',
            'product_code',
            'product_name',
            'property',
            'amount_fcfa',
            'status',
            'provider',
            'transaction_id',
            'operator',
            'provider_reference',
            'created_at',
            'completed_at',
        )


class CreateBoostOrderSerializer(PaymentInitSerializer):
    property_id = serializers.IntegerField()
    product_code = serializers.CharField(max_length=40)


class CreateSubscriptionOrderSerializer(PaymentInitSerializer):
    product_code = serializers.CharField(max_length=40)


class RentCommissionSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)

    class Meta:
        model = RentCommission
        fields = (
            'id',
            'property',
            'property_title',
            'monthly_rent_fcfa',
            'commission_rate_percent',
            'amount_fcfa',
            'status',
            'created_at',
            'paid_at',
        )

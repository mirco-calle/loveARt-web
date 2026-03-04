from rest_framework import serializers
from payments.models import CreditPack, PaymentOrder


class CreditPackSerializer(serializers.ModelSerializer):
    """Public serializer for displaying credit packs on the pricing page."""

    class Meta:
        model = CreditPack
        fields = [
            'id', 'name', 'slug', 'pack_type', 'credits',
            'price_bob', 'description', 'features',
            'is_featured', 'sort_order',
        ]


class PaymentOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new payment order."""

    class Meta:
        model = PaymentOrder
        fields = ['pack', 'method', 'proof_image', 'notes']

    def validate_pack(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Este pack ya no está disponible.")
        if value.pack_type == 'custom':
            raise serializers.ValidationError(
                "El plan Personalizado requiere contacto por WhatsApp."
            )
        return value


class PaymentOrderSerializer(serializers.ModelSerializer):
    """Serializer for reading payment order details."""
    pack_name = serializers.CharField(source='pack.name', read_only=True, default='—')

    class Meta:
        model = PaymentOrder
        fields = [
            'id', 'pack', 'pack_name', 'credits_purchased',
            'amount', 'currency', 'method', 'status',
            'proof_image', 'notes', 'created_at',
        ]
        read_only_fields = [
            'id', 'credits_purchased', 'amount', 'currency',
            'status', 'created_at',
        ]

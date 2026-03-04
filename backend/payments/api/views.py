from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from payments.models import CreditPack, PaymentOrder
from payments.api.serializers import (
    CreditPackSerializer,
    PaymentOrderCreateSerializer,
    PaymentOrderSerializer,
)


# ============================================
# PUBLIC ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def credit_packs_list(request):
    """
    GET /api/payments/packs/
    List all active credit packs for the pricing page.
    """
    packs = CreditPack.objects.filter(is_active=True)
    serializer = CreditPackSerializer(packs, many=True)
    return Response(serializer.data)


# ============================================
# AUTHENTICATED ENDPOINTS
# ============================================

@api_view(['GET'])
def my_credits(request):
    """
    GET /api/payments/credits/
    Get the current user's credit balance.
    """
    profile = request.user.profile
    return Response({
        'credits': profile.credits,
        'username': request.user.username,
    })


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_payment_order(request):
    """
    POST /api/payments/orders/
    Create a new payment order (user uploads proof of payment).
    """
    serializer = PaymentOrderCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    pack = serializer.validated_data['pack']

    order = PaymentOrder.objects.create(
        user=request.user,
        pack=pack,
        credits_purchased=pack.credits,
        amount=pack.price_bob,
        currency='BOB',
        method=serializer.validated_data.get('method', 'qr_bolivia'),
        proof_image=serializer.validated_data.get('proof_image'),
        notes=serializer.validated_data.get('notes', ''),
    )

    return Response(
        PaymentOrderSerializer(order).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def my_payment_orders(request):
    """
    GET /api/payments/orders/
    List all payment orders for the current user.
    """
    orders = PaymentOrder.objects.filter(user=request.user)
    serializer = PaymentOrderSerializer(orders, many=True)
    return Response(serializer.data)

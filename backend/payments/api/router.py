from django.urls import path

from payments.api.views import (
    credit_packs_list,
    my_credits,
    create_payment_order,
    my_payment_orders,
)

urlpatterns = [
    # Public
    path('packs/', credit_packs_list, name='credit-packs-list'),

    # Authenticated
    path('credits/', my_credits, name='my-credits'),
    path('orders/', my_payment_orders, name='my-payment-orders'),
    path('orders/create/', create_payment_order, name='create-payment-order'),
]

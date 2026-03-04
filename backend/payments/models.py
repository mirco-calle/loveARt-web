from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


def payment_proof_upload_path(instance, filename):
    return f'payments/{instance.user.id}/proofs/{filename}'


class CreditPack(models.Model):
    """
    Available credit packs for purchase.
    Managed via Django Admin.
    """
    PACK_TYPE_CHOICES = [
        ('custom', 'Personalizado (WhatsApp)'),
        ('self_service', 'Self-Service'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    pack_type = models.CharField(max_length=20, choices=PACK_TYPE_CHOICES, default='self_service')
    credits = models.PositiveIntegerField(help_text='Cantidad de proyectos AR incluidos')
    price_bob = models.DecimalField(max_digits=10, decimal_places=2, help_text='Precio en Bolivianos')
    description = models.TextField(blank=True, default='')
    features = models.JSONField(
        default=list, blank=True,
        help_text='Lista de features para mostrar en la página de precios. Ej: ["5 Proyectos AR", "Soporte por email"]'
    )
    is_featured = models.BooleanField(default=False, help_text='Destacar este pack como "Recomendado"')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0, help_text='Orden en la página de precios (menor = primero)')

    class Meta:
        verbose_name = 'Pack de Créditos'
        verbose_name_plural = 'Packs de Créditos'
        ordering = ['sort_order']

    def __str__(self):
        return f"{self.name} — {self.credits} créditos ({self.price_bob} BOB)"


class PaymentOrder(models.Model):
    """
    A payment order created when a user wants to buy credits.
    Admin manually approves/rejects after verifying the payment proof.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    METHOD_CHOICES = [
        ('qr_bolivia', 'QR Bolivia (Banco)'),
        ('whatsapp', 'WhatsApp (Personalizado)'),
        ('airtm', 'Airtm'),
        ('paypal', 'PayPal'),
        ('binance', 'Binance Pay'),
        ('other', 'Otro'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_orders')
    pack = models.ForeignKey(CreditPack, on_delete=models.SET_NULL, null=True, blank=True)
    credits_purchased = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='BOB')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='qr_bolivia')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Payment proof (screenshot of QR payment, transfer receipt, etc.)
    proof_image = models.ImageField(
        upload_to=payment_proof_upload_path,
        blank=True, null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])],
        help_text='Captura del comprobante de pago',
    )
    notes = models.TextField(blank=True, default='', help_text='Notas del usuario o del admin')

    # Admin tracking
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_payments',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Orden de Pago'
        verbose_name_plural = 'Órdenes de Pago'
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.id} — {self.user.username} — {self.credits_purchased} créditos — {self.get_status_display()}"

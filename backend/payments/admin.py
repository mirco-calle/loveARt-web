from django.contrib import admin
from django.utils import timezone

from payments.models import CreditPack, PaymentOrder


@admin.register(CreditPack)
class CreditPackAdmin(admin.ModelAdmin):
    list_display = ['name', 'pack_type', 'credits', 'price_bob', 'is_featured', 'is_active', 'sort_order']
    list_filter = ['pack_type', 'is_featured', 'is_active']
    list_editable = ['is_active', 'sort_order', 'is_featured']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'pack', 'credits_purchased', 'amount', 'method', 'status_badge', 'created_at']
    list_filter = ['status', 'method', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['user', 'pack', 'credits_purchased', 'amount', 'currency', 'method', 'proof_image', 'created_at', 'updated_at']
    actions = ['approve_payments', 'reject_payments']

    def status_badge(self, obj):
        colors = {
            'pending': '🟡',
            'approved': '🟢',
            'rejected': '🔴',
        }
        return f"{colors.get(obj.status, '⚪')} {obj.get_status_display()}"
    status_badge.short_description = 'Estado'

    def approve_payments(self, request, queryset):
        """Approve selected payments and add credits to users."""
        for order in queryset.filter(status='pending'):
            # Add credits to user profile
            profile = order.user.profile
            profile.credits += order.credits_purchased
            profile.save()

            # Update order
            order.status = 'approved'
            order.approved_by = request.user
            order.approved_at = timezone.now()
            order.save()

        self.message_user(request, f"✅ {queryset.count()} pago(s) aprobado(s) y créditos agregados.")
    approve_payments.short_description = "✅ Aprobar pagos seleccionados"

    def reject_payments(self, request, queryset):
        queryset.filter(status='pending').update(status='rejected')
        self.message_user(request, f"❌ {queryset.count()} pago(s) rechazado(s).")
    reject_payments.short_description = "❌ Rechazar pagos seleccionados"

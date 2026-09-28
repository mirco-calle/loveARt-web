from django.contrib import admin

from image_tracking.models import TrackingImage, TrackingVideo


class TrackingVideoInline(admin.StackedInline):
    model = TrackingVideo
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TrackingImage)
class TrackingImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'activation_pin', 'user', 'is_active', 'is_public', 'created_at']
    list_filter = ['is_active', 'is_public', 'created_at']
    search_fields = ['title', 'activation_pin', 'user__username']
    readonly_fields = ['activation_pin', 'created_at', 'updated_at']
    inlines = [TrackingVideoInline]


@admin.register(TrackingVideo)
class TrackingVideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'tracking_image', 'created_at']
    search_fields = ['title', 'tracking_image__title']
    readonly_fields = ['created_at', 'updated_at']

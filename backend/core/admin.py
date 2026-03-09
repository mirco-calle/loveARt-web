from django.contrib import admin
from core.models import AppBuild

@admin.register(AppBuild)
class AppBuildAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'is_latest', 'created_at')
    list_editable = ('is_latest',)
    search_fields = ('version', 'name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'version', 'apk_file', 'description', 'is_latest')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

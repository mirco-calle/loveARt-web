from django.contrib import admin

from architecture_ar.models import Blueprint, Model3D


class Model3DInline(admin.StackedInline):
    model = Model3D
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Blueprint)
class BlueprintAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [Model3DInline]


@admin.register(Model3D)
class Model3DAdmin(admin.ModelAdmin):
    list_display = ['title', 'blueprint', 'scale', 'created_at']
    search_fields = ['title', 'blueprint__title']
    readonly_fields = ['created_at', 'updated_at']

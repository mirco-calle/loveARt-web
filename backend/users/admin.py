from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from users.models import UserProfile


# ── Inline Profile inside User admin ─────────────────────────────────────────

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fields = ("avatar", "bio")


# ── Custom User admin — shows email prominently ───────────────────────────────

class UserAdmin(BaseUserAdmin):
    """
    Extended User admin that shows email in the list and makes it
    easy to add/edit — prevents accounts being created without email.
    """
    inlines = (UserProfileInline,)

    # Columns shown in the user list
    list_display = ("username", "email", "first_name", "last_name", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")

    # Make email a required, prominent field in the add/change form
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )


# Re-register User with the enhanced admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ── UserProfile admin (standalone) ───────────────────────────────────────────

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "user_email", "created_at", "updated_at")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Email")
    def user_email(self, obj):
        return obj.user.email

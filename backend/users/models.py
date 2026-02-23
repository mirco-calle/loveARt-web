import random
import string
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class UserProfile(models.Model):
    """
    Extended profile for User.
    Stores additional info relevant to the AR app.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
    )
    bio = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile of {self.user.username}"


# ── Email Verification OTP ──────────────────────────────────────────────────

def generate_otp():
    """Generate a random 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=6))


class EmailVerificationCode(models.Model):
    """
    Stores a 6-digit OTP for email verification.
    Expires 10 minutes after creation.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='verification_code',
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Email Verification Code'
        verbose_name_plural = 'Email Verification Codes'

    def is_valid(self):
        """Returns True if the code was created less than 10 minutes ago."""
        return timezone.now() < self.created_at + timedelta(minutes=10)

    def __str__(self):
        return f"OTP for {self.user.email} (valid: {self.is_valid()})"

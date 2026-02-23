import os

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


def tracking_image_upload_path(instance, filename):
    """Upload images to: uploads/tracking/<user_id>/images/<filename>"""
    return os.path.join('tracking', str(instance.user.id), 'images', filename)


def tracking_video_upload_path(instance, filename):
    """Upload videos to: uploads/tracking/<user_id>/videos/<filename>"""
    return os.path.join('tracking', str(instance.user.id), 'videos', filename)


class TrackingImage(models.Model):
    """
    Target image that will be recognized by the AR camera.
    This is the image that Vuforia/AR Foundation will detect in the real world.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tracking_images',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(
        upload_to=tracking_image_upload_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']),
        ],
        help_text='Target image for AR tracking (JPG, PNG, WebP).',
    )
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(
        default=False,
        help_text='If True, this content will be visible to ALL users (e.g. for ads or public art).',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tracking Image'
        verbose_name_plural = 'Tracking Images'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.title}"


class TrackingVideo(models.Model):
    """
    Video content associated with a TrackingImage.
    When the AR camera detects the TrackingImage, this video will be displayed.
    """
    tracking_image = models.OneToOneField(
        TrackingImage,
        on_delete=models.CASCADE,
        related_name='video',
    )
    title = models.CharField(max_length=255)
    video = models.FileField(
        upload_to=tracking_video_upload_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'mov', 'avi']),
        ],
        help_text='Video file to display in AR (MP4, WebM, MOV, AVI).',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def user(self):
        """Helper to access user from tracking_image for upload path."""
        return self.tracking_image.user

    class Meta:
        verbose_name = 'Tracking Video'
        verbose_name_plural = 'Tracking Videos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Video for: {self.tracking_image.title}"

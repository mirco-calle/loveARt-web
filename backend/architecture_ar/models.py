import os

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


def blueprint_upload_path(instance, filename):
    """Upload blueprints to: uploads/architecture/<user_id>/blueprints/<filename>"""
    return os.path.join('architecture', str(instance.user.id), 'blueprints', filename)


def model3d_upload_path(instance, filename):
    """Upload 3D models to: uploads/architecture/<user_id>/models3d/<filename>"""
    return os.path.join('architecture', str(instance.blueprint.user.id), 'models3d', filename)


class Blueprint(models.Model):
    """
    Architectural blueprint/plan image.
    This is the target image that the AR camera will detect (e.g. a floor plan photo).
    When detected, Unity will overlay the associated 3D model on top of it.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blueprints',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    image = models.FileField(
        upload_to=blueprint_upload_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'pdf']),
        ],
        help_text='Blueprint/plan file for AR tracking (JPG, PNG, WebP, PDF).',
    )
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(
        default=False,
        help_text='If True, this content will be visible to ALL users.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Blueprint'
        verbose_name_plural = 'Blueprints'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.title}"


class Model3D(models.Model):
    """
    3D model file associated with a Blueprint.
    When the AR camera detects the Blueprint image, this 3D model
    will be rendered on top of it in the Unity AR scene.
    Supports FBX, OBJ, GLB, and GLTF formats.
    """
    blueprint = models.OneToOneField(
        Blueprint,
        on_delete=models.CASCADE,
        related_name='model3d',
    )
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to=model3d_upload_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['fbx', 'obj', 'glb', 'gltf']),
        ],
        help_text='3D model file (FBX, OBJ, GLB, GLTF).',
    )
    # Optional: scale factor for Unity to apply when rendering
    scale = models.FloatField(
        default=1.0,
        help_text='Scale factor for the 3D model in AR scene.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = '3D Model'
        verbose_name_plural = '3D Models'
        ordering = ['-created_at']

    def __str__(self):
        return f"3D Model for: {self.blueprint.title}"

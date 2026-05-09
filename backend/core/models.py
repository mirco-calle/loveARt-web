import os
from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

def app_build_path(instance, filename):
    return os.path.join('app_builds', filename)

MAX_APK_SIZE_MB = 250

def validate_apk_size(value):
    filesize = value.size
    if filesize > MAX_APK_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"El APK es muy pesado ({round(filesize/1024/1024, 2)}MB). Máximo: {MAX_APK_SIZE_MB}MB")

class AppBuild(models.Model):
    name = models.CharField(max_length=255, default='loveARt')
    version = models.CharField(max_length=50, help_text="Ej: 1.0.0, v2.1")
    apk_file = models.FileField(
        upload_to=app_build_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['apk']),
            validate_apk_size
        ],
        help_text="Subir el archivo .apk generado en Unity."
    )
    description = models.TextField(blank=True, default='')
    is_latest = models.BooleanField(default=True, help_text="Si es la versión actual para descargar desde la landing.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.is_latest:
            # Set all other builds to not latest
            AppBuild.objects.filter(is_latest=True).update(is_latest=False)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'App Build'
        verbose_name_plural = 'App Builds'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - Version {self.version}"

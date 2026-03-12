import os
from io import BytesIO
from PIL import Image
from django.core.files import File
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.core.files.images import get_image_dimensions

# Constantes de optimización
MAX_IMAGE_SIZE_MB = 2 
MAX_VIDEO_SIZE_MB = 40

def validate_image_size(value):
    filesize = value.size
    if filesize > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"La imagen original es muy pesada ({round(filesize/1024/1024, 2)}MB). Máximo: {MAX_IMAGE_SIZE_MB}MB")

def validate_video_size(value):
    filesize = value.size
    if filesize > MAX_VIDEO_SIZE_MB * 1024 * 1024:
        raise ValidationError(f"El video es muy pesado ({round(filesize/1024/1024, 2)}MB). Máximo: {MAX_VIDEO_SIZE_MB}MB")

def validate_aspect_ratio(instance, value):
    width, height = get_image_dimensions(value)
    if not width or not height:
        return
    
    aspect_ratio = width / height
    if instance.aspect_ratio == '16:9':
        target = 16 / 9
    else: 
        target = 9 / 16
        
    tolerance = 0.2 
    if not (target - tolerance <= aspect_ratio <= target + tolerance):
        raise ValidationError(f"La imagen no coincide con el formato {instance.aspect_ratio} seleccionado.")


def tracking_image_upload_path(instance, filename):
    base_name = os.path.splitext(filename)[0]
    return os.path.join('tracking', str(instance.user.id), 'images', f"{base_name}.jpg")


def tracking_video_upload_path(instance, filename):
    return os.path.join('tracking', str(instance.user.id), 'videos', filename)


class TrackingImage(models.Model):
    ASPECT_RATIO_CHOICES = [
        ('16:9', 'Horizontal (16:9)'),
        ('9:16', 'Vertical (9:16)'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracking_images')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    aspect_ratio = models.CharField(max_length=10, choices=ASPECT_RATIO_CHOICES, default='16:9')
    image = models.ImageField(
        upload_to=tracking_image_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']), validate_image_size],
        help_text='Target image for AR tracking. Se convertirá automáticamente a JPG optimizado.'
    )
    
    # --- Technical Metadata ---
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="Peso en bytes de la imagen optimizada")
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    
    # New metadata fields for Unity
    resolution = models.CharField(max_length=20, blank=True, null=True, help_text="Resolución de la imagen (ej: 1920x1080)")
    physical_width = models.FloatField(default=0.1, help_text="Ancho físico de la imagen en metros (para AR)")
    image_size = models.FloatField(default=0.0, help_text="Tamaño de la imagen en MB")
    video_size = models.FloatField(default=0.0, help_text="Tamaño del video en MB")
    
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False, help_text="True=Proyecto público, False=Privado")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.image:
            validate_aspect_ratio(self, self.image)

    def save(self, *args, **kwargs):
        if self.image:
            img = Image.open(self.image)
            
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            max_size = 1280
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.LANCZOS)
            
            output = BytesIO()
            img.save(output, format='JPEG', quality=80, optimize=True)
            
            # Guardamos metadata técnica
            self.width = img.width
            self.height = img.height
            self.file_size = output.tell()
            self.resolution = f"{img.width}x{img.height}"
            self.image_size = round(self.file_size / (1024 * 1024), 2)
            
            output.seek(0)
            curr_name = os.path.splitext(self.image.name)[0]
            self.image = File(output, name=f"{curr_name}.jpg")

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Tracking Image'
        verbose_name_plural = 'Tracking Images'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.title} ({self.aspect_ratio})"


class TrackingVideo(models.Model):
    tracking_image = models.OneToOneField(TrackingImage, on_delete=models.CASCADE, related_name='video')
    title = models.CharField(max_length=255)
    video = models.FileField(
        upload_to=tracking_video_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'mov', 'avi']), validate_video_size],
        help_text='Video file to display in AR.'
    )
    
    # --- Technical Metadata ---
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="Peso en bytes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def user(self):
        return self.tracking_image.user
    
    def save(self, *args, **kwargs):
        if self.video:
            self.file_size = self.video.size
        super().save(*args, **kwargs)
        
        # Actualizar el tamaño del video en la imagen padre después de guardar
        if self.video and self.tracking_image:
            self.tracking_image.video_size = round(self.file_size / (1024 * 1024), 2)
            # Evitar recursión infinita usando update_fields
            type(self.tracking_image).objects.filter(pk=self.tracking_image.pk).update(video_size=self.tracking_image.video_size)

    class Meta:
        verbose_name = 'Tracking Video'
        verbose_name_plural = 'Tracking Videos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Video for: {self.tracking_image.title}"

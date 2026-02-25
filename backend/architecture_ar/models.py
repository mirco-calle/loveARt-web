import os
from io import BytesIO
from PIL import Image
from django.core.files import File
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

try:
    from pdf2image import convert_from_bytes
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

def blueprint_upload_path(instance, filename):
    base_name = os.path.splitext(filename)[0]
    return os.path.join('architecture', str(instance.user.id), 'blueprints', f"{base_name}.webp")


def model3d_upload_path(instance, filename):
    return os.path.join('architecture', str(instance.blueprint.user.id), 'models3d', filename)


class Blueprint(models.Model):
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
        help_text='Blueprint file (JPG, PNG, WebP, PDF). Se convertirá automáticamente a WebP.',
    )
    
    # --- Technical Metadata ---
    file_size = models.PositiveIntegerField(null=True, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    original_format = models.CharField(max_length=10, blank=True, null=True, help_text="Formato original (PDF, PNG, etc)")
    
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.image:
            filename = self.image.name.lower()
            self.original_format = os.path.splitext(filename)[1].replace('.', '').upper()
            
            try:
                if filename.endswith('.pdf'):
                    if not PDF_SUPPORT:
                        raise ValidationError("El servidor no tiene soporte para conversión de PDF.")
                    
                    pdf_bytes = self.image.read()
                    images = convert_from_bytes(pdf_bytes, first_page=1, last_page=1)
                    if not images:
                        raise ValidationError("No se pudo extraer una imagen del PDF.")
                    img = images[0]
                else:
                    img = Image.open(self.image)
                
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                max_size = 1280
                if img.width > max_size or img.height > max_size:
                    img.thumbnail((max_size, max_size), Image.LANCZOS)
                
                output = BytesIO()
                img.save(output, format='WebP', quality=80, method=6)
                
                # Metadata
                self.width = img.width
                self.height = img.height
                self.file_size = output.tell()
                
                output.seek(0)
                curr_name = os.path.splitext(self.image.name)[0]
                self.image = File(output, name=f"{curr_name}.webp")
            except Exception as e:
                print(f"Error procesando imagen/pdf: {e}")

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Blueprint'
        verbose_name_plural = 'Blueprints'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.title}"


class Model3D(models.Model):
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
    
    # --- Technical Metadata ---
    file_size = models.PositiveIntegerField(null=True, blank=True)
    
    scale = models.FloatField(
        default=1.0,
        help_text='Scale factor for the 3D model in AR scene.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = '3D Model'
        verbose_name_plural = '3D Models'
        ordering = ['-created_at']

    def __str__(self):
        return f"3D Model for: {self.blueprint.title}"

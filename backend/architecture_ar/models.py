import os
import logging
from io import BytesIO
from pathlib import Path

from PIL import Image
from django.core.files import File
from django.core.files.base import ContentFile
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

from architecture_ar.utils import (
    convert_to_glb,
    FORMATS_REQUIRING_CONVERSION,
    ALLOWED_3D_EXTENSIONS,
)

logger = logging.getLogger(__name__)

try:
    from pdf2image import convert_from_bytes
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

def blueprint_upload_path(instance, filename):
    base_name = os.path.splitext(filename)[0]
    return os.path.join('architecture', str(instance.user.id), 'blueprints', f"{base_name}.jpg")


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
        help_text='Blueprint file (JPG, PNG, WebP, PDF). Se convertirá automáticamente a JPG optimizado.',
    )
    
    # --- Technical Metadata ---
    file_size = models.PositiveIntegerField(null=True, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    original_format = models.CharField(max_length=10, blank=True, null=True, help_text="Formato original (PDF, PNG, etc)")
    
    # New metadata fields for Unity
    resolution = models.CharField(max_length=20, blank=True, null=True, help_text="Resolución de la vista previa (ej: 1920x1080)")
    image_size = models.FloatField(default=0.0, help_text="Tamaño de la imagen preview en MB")
    model_size = models.FloatField(default=0.0, help_text="Tamaño del archivo 3D/PDF en MB")
    
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False, help_text="True=Proyecto público, False=Privado")
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
                img.save(output, format='JPEG', quality=80, optimize=True)
                
                # Metadata
                self.width = img.width
                self.height = img.height
                self.file_size = output.tell()
                self.resolution = f"{img.width}x{img.height}"
                self.image_size = round(self.file_size / (1024 * 1024), 2)
                
                output.seek(0)
                curr_name = os.path.splitext(self.image.name)[0]
                self.image = File(output, name=f"{curr_name}.jpg")
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
            FileExtensionValidator(allowed_extensions=ALLOWED_3D_EXTENSIONS),
        ],
        help_text=(
            f'3D model file. Upload FBX or OBJ and we convert it automatically to GLB. '
            f'Accepted formats: {", ".join(f.lstrip(".").upper() for f in ALLOWED_3D_EXTENSIONS)}.'
        ),
    )

    # --- Technical Metadata ---
    file_size = models.PositiveIntegerField(null=True, blank=True)
    original_format = models.CharField(
        max_length=10, blank=True, null=True,
        help_text='Original upload format (FBX, OBJ, etc.) before conversion.',
    )

    scale = models.FloatField(
        default=1.0,
        help_text='Scale factor for the 3D model in AR scene.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Auto-convert FBX/OBJ uploads to GLB before persisting.

        Follows the same pattern as Blueprint.save() (PDF→JPG):
        the original file is transparently replaced by the converted one
        so callers and Unity always receive a .glb file.
        """
        if self.file:
            ext = Path(self.file.name).suffix.lower()
            self.original_format = ext.lstrip('.').upper()

            if ext in FORMATS_REQUIRING_CONVERSION:
                try:
                    # Read all bytes before the file pointer moves
                    raw_bytes = self.file.read()
                    glb_bytes = convert_to_glb(raw_bytes, self.file.name)

                    stem = Path(self.file.name).stem
                    glb_filename = f"{stem}.glb"

                    # Replace the in-memory file object with the converted one.
                    # ContentFile is an in-memory file that Django's storage
                    # backends (local disk & S3) handle transparently.
                    self.file = ContentFile(glb_bytes, name=glb_filename)
                    logger.info(
                        "Model3D '%s': converted %s → GLB (%d bytes)",
                        self.title, self.original_format, len(glb_bytes),
                    )
                except Exception as exc:
                    logger.error(
                        "Model3D '%s': conversion failed — %s", self.title, exc
                    )
                    raise ValidationError(
                        f"Could not convert '{self.original_format}' to GLB: {exc}"
                    ) from exc

            self.file_size = self.file.size if hasattr(self.file, 'size') else len(self.file.read())

        super().save(*args, **kwargs)
        
        # Actualizar el tamaño del modelo en el blueprint padre
        if self.file and self.blueprint:
            self.blueprint.model_size = round(self.file_size / (1024 * 1024), 2)
            type(self.blueprint).objects.filter(pk=self.blueprint.pk).update(model_size=self.blueprint.model_size)

    class Meta:
        verbose_name = '3D Model'
        verbose_name_plural = '3D Models'
        ordering = ['-created_at']

    def __str__(self):
        return f"3D Model for: {self.blueprint.title}"

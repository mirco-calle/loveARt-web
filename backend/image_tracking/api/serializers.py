from io import BytesIO
from django.core.files.base import ContentFile
import qrcode
from rest_framework import serializers
from django.utils.text import slugify

from image_tracking.models import TrackingImage, TrackingVideo, generate_unique_pin


def ensure_pin_and_qr(obj):
    """
    Asegura que el proyecto tenga PIN y código QR generados,
    incluso para registros creados anteriormente que no los tenían.
    """
    updated = False

    # 1. Si no tiene PIN, generar uno único y asignarlo
    if not obj.activation_pin:
        pin = generate_unique_pin()
        while TrackingImage.objects.filter(activation_pin=pin).exclude(pk=obj.pk).exists():
            pin = generate_unique_pin()
        obj.activation_pin = pin
        updated = True

    # 2. Si no tiene imagen QR, generarla
    if not obj.qr_code_image and obj.activation_pin:
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=4,
            )
            qr.add_data(obj.activation_pin)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_output = BytesIO()
            qr_img.save(qr_output)
            qr_output.seek(0)
            obj.qr_code_image.save(f"qr_{obj.activation_pin}.png", ContentFile(qr_output.read()), save=False)
            updated = True
        except Exception as e:
            print(f"[QR GENERATION WARNING] {e}")

    # Guardar en base de datos si se generó algo nuevo
    if updated and obj.pk:
        type(obj).objects.filter(pk=obj.pk).update(
            activation_pin=obj.activation_pin,
            qr_code_image=obj.qr_code_image
        )


class TrackingVideoSerializer(serializers.ModelSerializer):
    """Serializer for TrackingVideo — nested inside TrackingImage."""
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = TrackingVideo
        fields = ['id', 'title', 'video', 'video_url', 'file_size', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_video_url(self, obj):
        """Return absolute URL for Unity to download the video."""
        request = self.context.get('request')
        if obj.video and request:
            return request.build_absolute_uri(obj.video.url)
        return None


class TrackingImageSerializer(serializers.ModelSerializer):
    """
    Serializer for TrackingImage.
    Includes nested video data, absolute image URL and QR code URL.
    """
    video = TrackingVideoSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = TrackingImage
        fields = [
            'id', 'user', 'title', 'description',
            'aspect_ratio', 'image', 'image_url', 
            'activation_pin', 'qr_code_image', 'qr_code_url',
            'file_size', 'width', 'height',
            'resolution', 'image_size', 'video_size', 'physical_width',
            'is_active', 'is_public',
            'video', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'activation_pin', 'qr_code_image', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        """Return absolute URL for Unity to download the image."""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_qr_code_url(self, obj):
        """Return absolute URL for downloading the QR code."""
        request = self.context.get('request')
        ensure_pin_and_qr(obj)
        if obj.qr_code_image and request:
            return request.build_absolute_uri(obj.qr_code_image.url)
        return None

    def to_representation(self, instance):
        ensure_pin_and_qr(instance)
        return super().to_representation(instance)


class TrackingImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a TrackingImage (upload image)."""

    class Meta:
        model = TrackingImage
        fields = ['id', 'title', 'description', 'aspect_ratio', 'image', 'is_public']
        read_only_fields = ['id']

    def validate_is_public(self, value):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        is_admin = getattr(getattr(user, 'profile', None), 'is_admin', False)
        if value and not is_admin:
            raise serializers.ValidationError('Solo los administradores pueden publicar proyectos.')
        return value


class TrackingVideoUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading a video to an existing TrackingImage."""

    class Meta:
        model = TrackingVideo
        fields = ['id', 'title', 'video']
        read_only_fields = ['id']


class TrackingExperienceDataSerializer(serializers.ModelSerializer):
    """
    Complete serializer for Unity as requested by metadata instruction and activation spec.
    Maps TrackingImage fields + related video info + PIN/QR code.
    """
    name = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = TrackingImage
        fields = [
            'id', 'name', 'title', 'description',
            'activation_pin', 'qr_code_url',
            'image', 'image_url', 'video', 'video_url',
            'aspect_ratio', 'width', 'height', 'file_size',
            'physical_width', 'resolution', 'image_size', 'video_size',
            'is_public', 'is_active', 'created_at', 'updated_at'
        ]

    def get_name(self, obj):
        return slugify(obj.title).replace('-', '_')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_image(self, obj):
        return self.get_image_url(obj)

    def get_video_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'video') and obj.video and obj.video.video and request:
            return request.build_absolute_uri(obj.video.video.url)
        return None

    def get_video(self, obj):
        return self.get_video_url(obj)

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        ensure_pin_and_qr(obj)
        if obj.qr_code_image and request:
            return request.build_absolute_uri(obj.qr_code_image.url)
        return None

    def to_representation(self, instance):
        ensure_pin_and_qr(instance)
        return super().to_representation(instance)


class TrackingDataForUnitySerializer(TrackingExperienceDataSerializer):
    """Maintain backward compatibility name if needed, using the new complete format."""
    class Meta(TrackingExperienceDataSerializer.Meta):
        pass

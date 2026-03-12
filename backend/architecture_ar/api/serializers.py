from rest_framework import serializers
from django.utils.text import slugify

from architecture_ar.models import Blueprint, Model3D


class Model3DSerializer(serializers.ModelSerializer):
    """Serializer for Model3D — nested inside Blueprint."""
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Model3D
        fields = ['id', 'title', 'file', 'file_url', 'scale', 'file_size', 'original_format', 'created_at', 'updated_at']
        read_only_fields = ['id', 'original_format', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        """Return absolute URL for Unity to download the 3D model."""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class BlueprintSerializer(serializers.ModelSerializer):
    """
    Full serializer for Blueprint.
    Includes nested 3D model data and absolute image URL.
    """
    model3d = Model3DSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Blueprint
        fields = [
            'id', 'user', 'title', 'description',
            'image', 'image_url', 
            'file_size', 'width', 'height', 'original_format',
            'resolution', 'image_size', 'model_size',
            'is_active', 'is_public',
            'model3d', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        """Return absolute URL for Unity to download the blueprint image."""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class BlueprintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating a Blueprint (upload image)."""

    class Meta:
        model = Blueprint
        fields = ['id', 'title', 'description', 'image']
        read_only_fields = ['id']


class Model3DUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading a 3D model to an existing Blueprint."""

    class Meta:
        model = Model3D
        fields = ['id', 'title', 'file', 'scale']
        read_only_fields = ['id']


class ArchitectureExperienceDataSerializer(serializers.ModelSerializer):
    """
    Complete serializer for Unity as requested by metadata instruction.
    Maps Blueprint fields + related 3D model info.
    """
    name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    model3d_url = serializers.SerializerMethodField()
    model3d_scale = serializers.SerializerMethodField()
    
    # Aliases for compatibility with different Unity versions/expectations
    preview_image_url = serializers.SerializerMethodField()
    model_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Blueprint
        fields = [
            'id', 'name', 'title', 'description',
            'image_url', 'model3d_url', 'model3d_scale',
            'model_url', 'pdf_url', 'preview_image_url',
            'resolution', 'image_size', 'model_size', 'is_public',
            'is_active', 'created_at', 'updated_at'
        ]

    def get_name(self, obj):
        return slugify(obj.title).replace('-', '_')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_preview_image_url(self, obj):
        return self.get_image_url(obj)

    def get_model3d_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'model3d') and obj.model3d and obj.model3d.file and request:
            return request.build_absolute_uri(obj.model3d.file.url)
        return None

    def get_model_url(self, obj):
        return self.get_model3d_url(obj)

    def get_pdf_url(self, obj):
        # If the original was a PDF, this might be useful, though we convert to JPG.
        # Currently we don't store the original PDF separately after conversion in the same field.
        # But for now, we'll return None or empty as it's optional.
        return None

    def get_model3d_scale(self, obj):
        if hasattr(obj, 'model3d') and obj.model3d:
            return obj.model3d.scale
        return 1.0


class ArchitectureDataForUnitySerializer(ArchitectureExperienceDataSerializer):
    """Maintain backward compatibility name if needed, using the new complete format."""
    class Meta(ArchitectureExperienceDataSerializer.Meta):
        pass

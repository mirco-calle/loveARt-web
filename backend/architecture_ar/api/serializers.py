from rest_framework import serializers

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


class ArchitectureDataForUnitySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer optimized for Unity consumption.
    Returns only the essential data: blueprint image URL, 3D model URL, scale, and metadata.
    """
    image_url = serializers.SerializerMethodField()
    model3d_url = serializers.SerializerMethodField()
    model3d_scale = serializers.SerializerMethodField()

    class Meta:
        model = Blueprint
        fields = ['id', 'title', 'image_url', 'model3d_url', 'model3d_scale']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_model3d_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'model3d') and obj.model3d and obj.model3d.file and request:
            return request.build_absolute_uri(obj.model3d.file.url)
        return None

    def get_model3d_scale(self, obj):
        if hasattr(obj, 'model3d') and obj.model3d:
            return obj.model3d.scale
        return 1.0

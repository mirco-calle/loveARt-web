from rest_framework import serializers

from image_tracking.models import TrackingImage, TrackingVideo


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
    Includes nested video data and absolute image URL.
    """
    video = TrackingVideoSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = TrackingImage
        fields = [
            'id', 'user', 'title', 'description',
            'aspect_ratio', 'image', 'image_url', 
            'file_size', 'width', 'height',
            'is_active', 'video', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        """Return absolute URL for Unity to download the image."""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class TrackingImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a TrackingImage (upload image)."""

    class Meta:
        model = TrackingImage
        fields = ['id', 'title', 'description', 'aspect_ratio', 'image', 'is_active']
        read_only_fields = ['id']


class TrackingVideoUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading a video to an existing TrackingImage."""

    class Meta:
        model = TrackingVideo
        fields = ['id', 'title', 'video']
        read_only_fields = ['id']


class TrackingDataForUnitySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer optimized for Unity consumption.
    Returns only the essential data: image URL, video URL, and metadata.
    """
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = TrackingImage
        fields = ['id', 'title', 'image_url', 'video_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_video_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'video') and obj.video and obj.video.video and request:
            return request.build_absolute_uri(obj.video.video.url)
        return None

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from image_tracking.models import TrackingImage
from architecture_ar.models import Blueprint
from image_tracking.api.serializers import TrackingExperienceDataSerializer
from architecture_ar.api.serializers import ArchitectureExperienceDataSerializer

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def global_public_catalog(request):
    """
    GET /api/v1/public-catalog/
    Unified public catalog for the mobile app "Guest Mode".
    Returns both tracking images and architectural blueprints.
    """
    public_images = TrackingImage.objects.filter(is_public=True).select_related('video')
    public_blueprints = Blueprint.objects.filter(is_public=True).select_related('model3d')

    image_serializer = TrackingExperienceDataSerializer(
        public_images, many=True, context={'request': request}
    )
    blueprint_serializer = ArchitectureExperienceDataSerializer(
        public_blueprints, many=True, context={'request': request}
    )

    return Response({
        'vision_engine': image_serializer.data,
        'blueprint_3d': blueprint_serializer.data,
        'total_count': public_images.count() + public_blueprints.count()
    })

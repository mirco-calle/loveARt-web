from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from image_tracking.models import TrackingImage, TrackingVideo
from image_tracking.api.serializers import (
    TrackingImageSerializer,
    TrackingImageCreateSerializer,
    TrackingVideoSerializer,
    TrackingVideoUploadSerializer,
    TrackingDataForUnitySerializer,
)


# ============================================
# TRACKING IMAGE ENDPOINTS
# ============================================

@api_view(['GET'])
def tracking_image_list(request):
    """
    GET /api/tracking/images/
    List all tracking images for the authenticated user.
    """
    images = TrackingImage.objects.filter(user=request.user).select_related('video')
    serializer = TrackingImageSerializer(images, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def tracking_image_create(request):
    """
    POST /api/tracking/images/
    Upload a new tracking image (target for AR).
    Expects multipart/form-data with fields: title, description, image.
    """
    serializer = TrackingImageCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)

    # Return full data with URLs
    image = TrackingImage.objects.select_related('video').get(pk=serializer.instance.pk)
    return Response(
        TrackingImageSerializer(image, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def tracking_image_detail(request, pk):
    """
    GET /api/tracking/images/<pk>/
    Get detail of a specific tracking image.
    """
    try:
        image = TrackingImage.objects.select_related('video').get(pk=pk, user=request.user)
    except TrackingImage.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TrackingImageSerializer(image, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser])
def tracking_image_update(request, pk):
    """
    PUT/PATCH /api/tracking/images/<pk>/
    Update a tracking image (title, description, or replace image file).
    """
    try:
        image = TrackingImage.objects.get(pk=pk, user=request.user)
    except TrackingImage.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TrackingImageCreateSerializer(
        image,
        data=request.data,
        partial=request.method == 'PATCH',
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    image.refresh_from_db()
    return Response(
        TrackingImageSerializer(image, context={'request': request}).data,
    )


@api_view(['DELETE'])
def tracking_image_delete(request, pk):
    """
    DELETE /api/tracking/images/<pk>/
    Delete a tracking image and its associated video.
    """
    try:
        image = TrackingImage.objects.get(pk=pk, user=request.user)
    except TrackingImage.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    image.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================
# TRACKING VIDEO ENDPOINTS
# ============================================

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def tracking_video_upload(request, image_pk):
    """
    POST /api/tracking/images/<image_pk>/video/
    Upload or replace the video for a tracking image.
    Expects multipart/form-data with fields: title, video.
    """
    try:
        image = TrackingImage.objects.get(pk=image_pk, user=request.user)
    except TrackingImage.DoesNotExist:
        return Response({'error': 'Tracking image not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Delete existing video if any (replace)
    if hasattr(image, 'video') and image.video:
        image.video.delete()

    serializer = TrackingVideoUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(tracking_image=image)

    # Return full image data with new video
    image.refresh_from_db()
    return Response(
        TrackingImageSerializer(image, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
def tracking_video_delete(request, image_pk):
    """
    DELETE /api/tracking/images/<image_pk>/video/
    Delete the video from a tracking image.
    """
    try:
        image = TrackingImage.objects.get(pk=image_pk, user=request.user)
    except TrackingImage.DoesNotExist:
        return Response({'error': 'Tracking image not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not hasattr(image, 'video') or not image.video:
        return Response({'error': 'No video found.'}, status=status.HTTP_404_NOT_FOUND)

    image.video.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================
# UNITY ENDPOINT (Public or Token-based)
# ============================================

from django.db.models import Q

@api_view(['GET'])
def unity_tracking_data(request):
    """
    GET /api/tracking/unity/me/
    **Authenticated** endpoint for Unity.
    Returns tracking images + video URLs ONLY for the logged-in user.
    """
    images = (
        TrackingImage.objects
        .filter(user=request.user, is_active=True)
        .select_related('video')
    )
    serializer = TrackingDataForUnitySerializer(
        images, many=True, context={'request': request},
    )
    return Response({
        'count': images.count(),
        'results': serializer.data,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def unity_tracking_catalog(request):
    """
    GET /api/tracking/unity/catalog/
    **Public** endpoint for Unity.
    Returns ONLY public tracking images (ads, art, campaigns) for the AR Catalog.
    """
    images = (
        TrackingImage.objects
        .filter(is_public=True, is_active=True)
        .select_related('video')
    )
    serializer = TrackingDataForUnitySerializer(
        images, many=True, context={'request': request},
    )
    return Response({
        'count': images.count(),
        'results': serializer.data,
    })

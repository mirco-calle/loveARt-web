from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from architecture_ar.models import Blueprint, Model3D
from architecture_ar.api.serializers import (
    BlueprintSerializer,
    BlueprintCreateSerializer,
    Model3DSerializer,
    Model3DUploadSerializer,
    ArchitectureExperienceDataSerializer,
    ArchitectureDataForUnitySerializer,
)


# ============================================
# BLUEPRINT ENDPOINTS
# ============================================

@api_view(['GET'])
def blueprint_list(request):
    """
    GET /api/architecture/blueprints/
    List all blueprints for the authenticated user.
    """
    blueprints = Blueprint.objects.filter(user=request.user).select_related('model3d')
    serializer = BlueprintSerializer(blueprints, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def blueprint_create(request):
    """
    POST /api/architecture/blueprints/create/
    Upload a new blueprint image (architectural plan for AR tracking).
    Expects multipart/form-data with fields: title, description, image.
    """
    serializer = BlueprintCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)

    blueprint = Blueprint.objects.select_related('model3d').get(pk=serializer.instance.pk)
    return Response(
        BlueprintSerializer(blueprint, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def blueprint_detail(request, pk):
    """
    GET /api/architecture/blueprints/<pk>/
    Get detail of a specific blueprint.
    """
    try:
        blueprint = Blueprint.objects.select_related('model3d').get(pk=pk, user=request.user)
    except Blueprint.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = BlueprintSerializer(blueprint, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser])
def blueprint_update(request, pk):
    """
    PUT/PATCH /api/architecture/blueprints/<pk>/update/
    Update a blueprint (title, description, or replace image file).
    """
    try:
        blueprint = Blueprint.objects.get(pk=pk, user=request.user)
    except Blueprint.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = BlueprintCreateSerializer(
        blueprint,
        data=request.data,
        partial=request.method == 'PATCH',
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    blueprint.refresh_from_db()
    return Response(
        BlueprintSerializer(blueprint, context={'request': request}).data,
    )


@api_view(['DELETE'])
def blueprint_delete(request, pk):
    """
    DELETE /api/architecture/blueprints/<pk>/delete/
    Delete a blueprint and its associated 3D model.
    """
    try:
        blueprint = Blueprint.objects.get(pk=pk, user=request.user)
    except Blueprint.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    blueprint.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================
# 3D MODEL ENDPOINTS
# ============================================

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def model3d_upload(request, blueprint_pk):
    """
    POST /api/architecture/blueprints/<blueprint_pk>/model3d/
    Upload or replace the 3D model for a blueprint.
    Expects multipart/form-data with fields: title, file, scale (optional).
    """
    try:
        blueprint = Blueprint.objects.get(pk=blueprint_pk, user=request.user)
    except Blueprint.DoesNotExist:
        return Response({'error': 'Blueprint not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Delete existing 3D model if any (replace)
    if hasattr(blueprint, 'model3d') and blueprint.model3d:
        blueprint.model3d.delete()

    serializer = Model3DUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(blueprint=blueprint)

    blueprint.refresh_from_db()
    return Response(
        BlueprintSerializer(blueprint, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
def model3d_delete(request, blueprint_pk):
    """
    DELETE /api/architecture/blueprints/<blueprint_pk>/model3d/delete/
    Delete the 3D model from a blueprint.
    """
    try:
        blueprint = Blueprint.objects.get(pk=blueprint_pk, user=request.user)
    except Blueprint.DoesNotExist:
        return Response({'error': 'Blueprint not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not hasattr(blueprint, 'model3d') or not blueprint.model3d:
        return Response({'error': 'No 3D model found.'}, status=status.HTTP_404_NOT_FOUND)

    blueprint.model3d.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================
# UNITY ENDPOINT (Public)
# ============================================

from django.db.models import Q

@api_view(['GET'])
def unity_architecture_data(request):
    """
    GET /api/architecture/unity/me/
    **Authenticated** endpoint for Unity.
    Returns blueprints + 3D model URLs ONLY for the logged-in user.
    """
    blueprints = (
        Blueprint.objects
        .filter(user=request.user)
        .select_related('model3d')
    )
    serializer = ArchitectureExperienceDataSerializer(
        blueprints, many=True, context={'request': request},
    )
    return Response({
        'count': blueprints.count(),
        'results': serializer.data,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def unity_architecture_catalog(request):
    """
    GET /api/architecture/unity/catalog/
    **Public** endpoint for Unity.
    Returns ONLY public blueprints for the Architecture Catalog.
    """
    blueprints = (
        Blueprint.objects
        .filter(is_public=True)
        .select_related('model3d')
    )
    serializer = ArchitectureExperienceDataSerializer(
        blueprints, many=True, context={'request': request},
    )
    return Response({
        'count': blueprints.count(),
        'results': serializer.data,
    })

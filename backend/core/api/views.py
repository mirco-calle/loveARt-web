from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from core.models import AppBuild
from core.api.serializers import AppBuildSerializer

class LatestAppBuildView(APIView):
    """
    Vista pública para obtener el enlace de descarga de la última versión de loveARt.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest_build = AppBuild.objects.filter(is_latest=True).first()
        if not latest_build:
            return Response({"error": "No hay build disponible actualmente."}, status=404)
        
        serializer = AppBuildSerializer(latest_build)
        return Response(serializer.data)

import os
from django.http import FileResponse, Http404
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import AppBuild
from core.api.serializers import AppBuildSerializer


class LatestAppBuildView(APIView):
    """
    Vista pública para obtener la metadata y enlace de descarga de la última versión de loveARt.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest_build = AppBuild.objects.filter(is_latest=True).first()
        if not latest_build:
            return Response({"error": "No hay build disponible actualmente."}, status=404)
        
        serializer = AppBuildSerializer(latest_build, context={'request': request})
        return Response(serializer.data)


class DownloadLatestAppBuildView(APIView):
    """
    Descarga directa y en streaming del archivo .apk más reciente.
    Optimizado con FileResponse para no saturar memoria RAM en Azure VM.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest_build = AppBuild.objects.filter(is_latest=True).first()
        if not latest_build or not latest_build.apk_file:
            raise Http404("No hay ninguna versión de APK disponible para descargar.")

        try:
            file_handle = latest_build.apk_file.open('rb')
        except (FileNotFoundError, ValueError):
            raise Http404("El archivo APK no se encuentra en el almacenamiento del servidor.")

        filename = os.path.basename(latest_build.apk_file.name) or f"loveARt-{latest_build.version}.apk"
        response = FileResponse(
            file_handle,
            content_type='application/vnd.android.package-archive',
            as_attachment=True,
            filename=filename,
        )
        return response

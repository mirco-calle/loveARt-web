import os
from django.http import FileResponse, Http404
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import AppBuild
from core.api.serializers import AppBuildSerializer


def get_current_app_build():
    """
    Obtiene la versión marcada como is_latest, o como fallback
    la versión más reciente registrada en la base de datos.
    """
    build = AppBuild.objects.filter(is_latest=True).first()
    if not build:
        build = AppBuild.objects.order_by('-created_at').first()
    return build


class LatestAppBuildView(APIView):
    """
    Vista pública para obtener la metadata y enlace de descarga de la última versión de loveARt.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest_build = get_current_app_build()
        if not latest_build:
            return Response(
                {"error": "No hay ningún build de la aplicación registrado en el sistema."},
                status=404
            )
        
        serializer = AppBuildSerializer(latest_build, context={'request': request})
        return Response(serializer.data)


class DownloadLatestAppBuildView(APIView):
    """
    Descarga directa y en streaming del archivo .apk más reciente.
    Optimizado con FileResponse para no saturar memoria RAM en Azure VM.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest_build = get_current_app_build()
        if not latest_build or not latest_build.apk_file:
            raise Http404("No hay ninguna versión de APK disponible para descargar.")

        try:
            file_handle = latest_build.apk_file.open('rb')
        except (FileNotFoundError, ValueError):
            raise Http404("El archivo APK no se encuentra físicamente en el almacenamiento del servidor.")

        filename = os.path.basename(latest_build.apk_file.name) or f"loveARt-{latest_build.version}.apk"
        response = FileResponse(
            file_handle,
            content_type='application/vnd.android.package-archive',
            as_attachment=True,
            filename=filename,
        )
        return response

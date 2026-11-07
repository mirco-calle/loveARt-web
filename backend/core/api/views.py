import os
from django.conf import settings
from django.http import FileResponse
from django.shortcuts import redirect
from rest_framework import permissions, status
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
                {"error": "No hay ningún build de la aplicación registrado en la base de datos."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AppBuildSerializer(latest_build, context={'request': request})
        return Response(serializer.data)


class DownloadLatestAppBuildView(APIView):
    """
    Descarga directa y en streaming del archivo .apk más reciente.
    Optimizado con FileResponse para no saturar memoria RAM en Azure VM.
    Busca de forma resiliente tanto en almacenamiento remoto (S3) como en rutas locales.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        latest_build = get_current_app_build()
        if not latest_build or not latest_build.apk_file:
            return Response(
                {
                    "error": "BUILD_NOT_FOUND",
                    "detail": "No hay ninguna versión de APK registrada en la base de datos."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        apk = latest_build.apk_file

        # 1. Si el archivo reside en Supabase Storage / S3 remoto
        try:
            url = apk.url
            if url and (url.startswith("http://") or url.startswith("https://")):
                return redirect(url)
        except Exception:
            pass

        # 2. Rutas candidatas en el sistema de archivos local
        candidates = []
        try:
            if hasattr(apk, 'path') and apk.path:
                candidates.append(apk.path)
        except Exception:
            pass

        base_filename = os.path.basename(apk.name)
        uploads_dir = os.path.join(str(settings.BASE_DIR), "uploads")
        media_root = str(getattr(settings, 'MEDIA_ROOT', uploads_dir))

        candidates.extend([
            os.path.join(media_root, apk.name),
            os.path.join(media_root, "app_builds", base_filename),
            os.path.join(uploads_dir, apk.name),
            os.path.join(uploads_dir, "app_builds", base_filename),
            os.path.join("/app", "uploads", apk.name),
            os.path.join("/app", "uploads", "app_builds", base_filename),
        ])

        found_path = None
        for path in candidates:
            if path and os.path.isfile(path):
                found_path = path
                break

        # Fallback: buscar cualquier archivo .apk en la carpeta app_builds
        if not found_path:
            for build_dir in [os.path.join(uploads_dir, "app_builds"), os.path.join(media_root, "app_builds")]:
                if os.path.isdir(build_dir):
                    apk_files = [os.path.join(build_dir, f) for f in os.listdir(build_dir) if f.lower().endswith('.apk')]
                    if apk_files:
                        # Usar el archivo .apk más reciente encontrado en la carpeta
                        found_path = max(apk_files, key=os.path.getmtime)
                        break

        # Si tras todos los intentos no se encontró el archivo físico
        if not found_path:
            # Intentar abrir a través de storage API de Django
            try:
                handle = apk.open('rb')
                filename = base_filename or f"loveARt-{latest_build.version}.apk"
                return FileResponse(
                    handle,
                    content_type='application/vnd.android.package-archive',
                    as_attachment=True,
                    filename=filename,
                )
            except Exception:
                return Response(
                    {
                        "error": "APK_FILE_NOT_FOUND_ON_DISK",
                        "detail": f"El registro existe en la base de datos (Supabase), pero el archivo físico '{base_filename}' no existe en el disco de la Azure VM.",
                        "solution": "Por favor sube nuevamente el archivo APK desde el panel de Django Admin (https://api.loveart.mircodev.com/admin/core/appbuild/).",
                        "searched_paths": candidates[:3],
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

        # Transmitir el archivo encontrado en streaming
        filename = os.path.basename(found_path) or f"loveARt-{latest_build.version}.apk"
        return FileResponse(
            open(found_path, 'rb'),
            content_type='application/vnd.android.package-archive',
            as_attachment=True,
            filename=filename,
        )

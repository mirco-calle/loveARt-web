"""
URL configuration for loveart project.

All API endpoints are prefixed with /api/
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.shortcuts import redirect

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


def api_root(request):
    """Root endpoint - API info"""
    return JsonResponse({
        'message': 'LoveArt AR API',
        'version': '1.0.0',
        'endpoints': {
            'users': '/api/users/',
            'tracking': '/api/tracking/',
            'architecture': '/api/architecture/',
            'docs': '/api/docs/',
            'schema': '/api/schema/',
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),

    # Shortcuts (redirects)
    path('docs/', lambda r: redirect('/api/docs/', permanent=False)),
    path('schema/', lambda r: redirect('/api/schema/', permanent=False)),

    # API endpoints
    path('api/users/', include('users.api.routes')),
    path('api/tracking/', include('image_tracking.api.router')),
    path('api/architecture/', include('architecture_ar.api.router')),

    # API Documentation (Swagger / ReDoc)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

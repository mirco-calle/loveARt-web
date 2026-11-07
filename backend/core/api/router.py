from django.urls import path
from core.api.views import LatestAppBuildView, DownloadLatestAppBuildView

urlpatterns = [
    path('latest-build/', LatestAppBuildView.as_view(), name='latest-build'),
    path('download-latest-apk/', DownloadLatestAppBuildView.as_view(), name='download-latest-apk'),
]

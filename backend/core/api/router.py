from django.urls import path
from core.api.views import LatestAppBuildView

urlpatterns = [
    path('latest-build/', LatestAppBuildView.as_view(), name='latest-build'),
]

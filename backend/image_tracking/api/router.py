from django.urls import path

from image_tracking.api.views import (
    tracking_image_list,
    tracking_image_create,
    tracking_image_detail,
    tracking_image_update,
    tracking_image_delete,
    tracking_video_upload,
    tracking_video_delete,
    unity_tracking_data,
    unity_tracking_catalog,
)

urlpatterns = [
    # Tracking Images CRUD
    path('images/', tracking_image_list, name='tracking-image-list'),
    path('images/create/', tracking_image_create, name='tracking-image-create'),
    path('images/<int:pk>/', tracking_image_detail, name='tracking-image-detail'),
    path('images/<int:pk>/update/', tracking_image_update, name='tracking-image-update'),
    path('images/<int:pk>/delete/', tracking_image_delete, name='tracking-image-delete'),

    # Tracking Video (nested under image)
    path('images/<int:image_pk>/video/', tracking_video_upload, name='tracking-video-upload'),
    path('images/<int:image_pk>/video/delete/', tracking_video_delete, name='tracking-video-delete'),

    # Unity consumption endpoints
    path('unity/me/', unity_tracking_data, name='unity-tracking-data'),
    path('unity/catalog/', unity_tracking_catalog, name='unity-tracking-catalog'),
]

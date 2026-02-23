from django.urls import path

from architecture_ar.api.views import (
    blueprint_list,
    blueprint_create,
    blueprint_detail,
    blueprint_update,
    blueprint_delete,
    model3d_upload,
    model3d_delete,
    unity_architecture_data,
    unity_architecture_catalog,
)

urlpatterns = [
    # Blueprints CRUD
    path('blueprints/', blueprint_list, name='blueprint-list'),
    path('blueprints/create/', blueprint_create, name='blueprint-create'),
    path('blueprints/<int:pk>/', blueprint_detail, name='blueprint-detail'),
    path('blueprints/<int:pk>/update/', blueprint_update, name='blueprint-update'),
    path('blueprints/<int:pk>/delete/', blueprint_delete, name='blueprint-delete'),

    # 3D Model (nested under blueprint)
    path('blueprints/<int:blueprint_pk>/model3d/', model3d_upload, name='model3d-upload'),
    path('blueprints/<int:blueprint_pk>/model3d/delete/', model3d_delete, name='model3d-delete'),

    # Unity consumption endpoints
    path('unity/me/', unity_architecture_data, name='unity-architecture-data'),
    path('unity/catalog/', unity_architecture_catalog, name='unity-architecture-catalog'),
]

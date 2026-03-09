from rest_framework import serializers
from core.models import AppBuild

class AppBuildSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppBuild
        fields = ['id', 'name', 'version', 'apk_file', 'description', 'updated_at']

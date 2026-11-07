from django.urls import reverse
from rest_framework import serializers
from core.models import AppBuild


class AppBuildSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = AppBuild
        fields = ['id', 'name', 'version', 'apk_file', 'download_url', 'description', 'updated_at']

    def get_download_url(self, obj):
        request = self.context.get('request')
        endpoint = reverse('download-latest-apk')
        if request:
            return request.build_absolute_uri(endpoint)
        return endpoint

import tempfile
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from core.models import AppBuild


class AppBuildAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_latest_build_not_found(self):
        response = self.client.get(reverse('latest-build'))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_latest_build_returns_data_with_download_url(self):
        dummy_apk = SimpleUploadedFile(
            "loveart-v1.apk",
            b"PK\x03\x04dummyapkcontent",
            content_type="application/vnd.android.package-archive"
        )
        build = AppBuild.objects.create(
            name="loveARt",
            version="1.0.0",
            apk_file=dummy_apk,
            is_latest=True
        )

        response = self.client.get(reverse('latest-build'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], "1.0.0")
        self.assertIn('download_url', response.data)
        self.assertTrue(response.data['download_url'].endswith(reverse('download-latest-apk')))

    def test_download_latest_apk_endpoint(self):
        dummy_apk = SimpleUploadedFile(
            "loveart-v1.apk",
            b"PK\x03\x04dummyapkcontent",
            content_type="application/vnd.android.package-archive"
        )
        AppBuild.objects.create(
            name="loveARt",
            version="1.0.0",
            apk_file=dummy_apk,
            is_latest=True
        )

        response = self.client.get(reverse('download-latest-apk'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers['Content-Type'], 'application/vnd.android.package-archive')
        self.assertIn('attachment', response.headers.get('Content-Disposition', ''))


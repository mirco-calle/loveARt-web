from types import SimpleNamespace
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from image_tracking.api.serializers import TrackingImageCreateSerializer
from image_tracking.models import TrackingImage
from users.models import UserProfile


class TrackingImageVisibilitySerializerTests(TestCase):
    def test_admin_can_make_tracking_image_public(self):
        user = User.objects.create_user(username='admin')
        UserProfile.objects.create(user=user, is_admin=True)
        serializer = TrackingImageCreateSerializer(
            data={'is_public': True},
            partial=True,
            context={'request': SimpleNamespace(user=user)},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_non_admin_cannot_make_tracking_image_public(self):
        user = User.objects.create_user(username='user')
        UserProfile.objects.create(user=user)
        serializer = TrackingImageCreateSerializer(
            data={'is_public': True},
            partial=True,
            context={'request': SimpleNamespace(user=user)},
        )
        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors['is_public'][0],
            'Solo los administradores pueden publicar proyectos.',
        )


class TrackingActivationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='creator', password='testpassword123')

    def test_activate_without_code_returns_400(self):
        response = self.client.post(reverse('tracking-activate'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_activate_with_invalid_code_returns_404(self):
        response = self.client.post(reverse('tracking-activate'), {'code': 'INVALID99'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_activate_with_valid_pin_returns_experience_data(self):
        # Create experience with a specific pin
        experience = TrackingImage.objects.create(
            user=self.user,
            title="Recuerdo Matrimonio",
            aspect_ratio="16:9",
            activation_pin="DEMO99",
            is_active=True,
        )

        response = self.client.post(reverse('tracking-activate'), {'code': 'demo99'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Recuerdo Matrimonio")
        self.assertEqual(response.data['activation_pin'], "DEMO99")

from django.test import TestCase
from django.contrib.auth.models import User
from types import SimpleNamespace

from image_tracking.api.serializers import TrackingImageCreateSerializer
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

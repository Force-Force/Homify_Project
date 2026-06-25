"""Notification API tests."""
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.notifications.models import Notification, NotificationPreference
from apps.notifications.services import NotificationDispatchService

User = get_user_model()


class NotificationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='notify@test.cm',
            password='SecurePass1!',
            first_name='Test',
            last_name='User',
            role='TENANT',
            email_verified=True,
        )
        NotificationPreference.objects.filter(user=self.user).delete()
        NotificationPreference.objects.create(
            user=self.user,
            email_notifications=True,
            message_alerts=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_list_notifications(self):
        NotificationDispatchService.notify(
            self.user,
            'SYSTEM',
            'Bienvenue',
            'Votre compte est actif.',
        )
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_unread_count_and_mark_read(self):
        notif = NotificationDispatchService.notify(
            self.user,
            'SYSTEM',
            'Alerte',
            'Contenu test.',
        )
        count = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(count.data['unread_count'], 1)

        mark = self.client.post(f'/api/notifications/{notif.id}/mark_read/')
        self.assertEqual(mark.status_code, status.HTTP_200_OK)
        self.assertTrue(mark.data['is_read'])

        count_after = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(count_after.data['unread_count'], 0)

    def test_notification_preferences(self):
        response = self.client.patch(
            '/api/notifications/preferences/',
            {'message_alerts': False},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['message_alerts'])

        prefs = NotificationPreference.objects.get(user=self.user)
        self.assertFalse(prefs.message_alerts)

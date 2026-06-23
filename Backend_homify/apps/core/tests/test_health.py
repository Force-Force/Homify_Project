from django.test import TestCase
from django.urls import reverse


class HealthCheckTests(TestCase):
    def test_health_returns_ok(self):
        response = self.client.get(reverse('health'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['database'], 'ok')

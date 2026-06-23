from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.properties.models import Address, Property

User = get_user_model()


class ApiSmokeTests(APITestCase):
    def test_public_properties_list(self):
        response = self.client.get('/api/properties/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_register_and_login(self):
        payload = {
            'email': 'tenant@test.cm',
            'password': 'SecurePass1!',
            'password_confirm': 'SecurePass1!',
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'role': 'TENANT',
        }
        register = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(register.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='tenant@test.cm')
        user.email_verified = True
        user.role = 'TENANT'
        user.save(update_fields=['email_verified', 'role'])

        login = self.client.post(
            '/api/auth/login/',
            {'email': 'tenant@test.cm', 'password': 'SecurePass1!'},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn('access', login.data)

    def test_published_property_visible_in_list(self):
        landlord = User.objects.create_user(
            email='landlord@test.cm',
            password='SecurePass1!',
            first_name='Marie',
            last_name='Land',
            role='LANDLORD',
            email_verified=True,
        )
        prop = Property.objects.create(
            landlord=landlord,
            title='Studio Bastos',
            description='Bel studio meublé',
            type='STUDIO',
            surface=35,
            number_of_rooms=2,
            number_of_bedrooms=1,
            number_of_bathrooms=1,
            monthly_rent=Decimal('150000'),
            status='PUBLISHED',
        )
        Address.objects.create(
            property=prop,
            street_address='Rue 123',
            city='Yaoundé',
            postal_code='00237',
            district='Bastos',
        )

        response = self.client.get('/api/properties/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data['results']]
        self.assertIn(prop.id, ids)

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.chat.models import Message
from apps.properties.models import Address, Property

User = get_user_model()


class ConversationApiTests(APITestCase):
    def setUp(self):
        self.tenant = User.objects.create_user(
            email='tenant@msg.cm',
            password='SecurePass1!',
            first_name='Jean',
            last_name='Loc',
            role='TENANT',
            email_verified=True,
        )
        self.landlord = User.objects.create_user(
            email='landlord@msg.cm',
            password='SecurePass1!',
            first_name='Marie',
            last_name='Own',
            role='LANDLORD',
            email_verified=True,
        )
        self.prop = Property.objects.create(
            landlord=self.landlord,
            title='Studio Bastos',
            description='Test',
            type='STUDIO',
            surface=30,
            number_of_rooms=2,
            number_of_bedrooms=1,
            number_of_bathrooms=1,
            monthly_rent='150000',
            status='PUBLISHED',
        )
        Address.objects.create(
            property=self.prop,
            street_address='Rue 1',
            city='Yaoundé',
            postal_code='00237',
        )
        Message.objects.create(
            property=self.prop,
            sender=self.tenant,
            recipient=self.landlord,
            subject='Contact',
            content='Bonjour, je suis intéressé par ce studio disponible.',
        )

    def test_conversations_lists_thread(self):
        self.client.force_authenticate(user=self.tenant)
        response = self.client.get('/api/messages/conversations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['property_id'], self.prop.id)
        self.assertEqual(response.data[0]['unread_count'], 0)

    def test_mark_thread_read(self):
        msg = Message.objects.get(property=self.prop)
        self.client.force_authenticate(user=self.landlord)
        response = self.client.post(f'/api/messages/thread/{self.prop.id}/mark_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['marked_read'], 1)
        msg.refresh_from_db()
        self.assertTrue(msg.is_read)

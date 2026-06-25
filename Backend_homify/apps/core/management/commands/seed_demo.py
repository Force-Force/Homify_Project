"""
Populate the database with demo users, properties and interactions.

Usage:
    python manage.py seed_demo
    python manage.py seed_demo --reset
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.amenities.models import Amenity
from apps.chat.models import Message
from apps.favorites.models import Favorite
from apps.notifications.models import Notification, NotificationPreference
from apps.properties.models import Address, Property
from apps.reports.models import Report

User = get_user_model()

DEMO_DOMAIN = '@demo.homify.cm'
DEMO_PASSWORD = 'Demo1234!'

DEMO_USERS = [
    {
        'email': f'admin{DEMO_DOMAIN}',
        'first_name': 'Admin',
        'last_name': 'Homify',
        'phone': '237690000001',
        'role': 'ADMIN',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'email': f'marie.proprio{DEMO_DOMAIN}',
        'first_name': 'Marie',
        'last_name': 'Nkodo',
        'phone': '237690000010',
        'role': 'LANDLORD',
    },
    {
        'email': f'paul.proprio{DEMO_DOMAIN}',
        'first_name': 'Paul',
        'last_name': 'Mbarga',
        'phone': '237690000011',
        'role': 'LANDLORD',
    },
    {
        'email': f'sophie.loc{DEMO_DOMAIN}',
        'first_name': 'Sophie',
        'last_name': 'Fouda',
        'phone': '237690000020',
        'role': 'TENANT',
    },
    {
        'email': f'jean.loc{DEMO_DOMAIN}',
        'first_name': 'Jean',
        'last_name': 'Tchinda',
        'phone': '237690000021',
        'role': 'TENANT',
    },
    {
        'email': f'aminata.loc{DEMO_DOMAIN}',
        'first_name': 'Aminata',
        'last_name': 'Bello',
        'phone': '237690000022',
        'role': 'TENANT',
    },
]

AMENITIES = [
    {'name': 'Internet fibre', 'icon': 'wifi', 'category': 'CONNECTIVITY'},
    {'name': 'Climatisation', 'icon': 'air-conditioner', 'category': 'COMFORT'},
    {'name': 'Parking privé', 'icon': 'car', 'category': 'EXTERIOR'},
    {'name': 'Gardien 24h/24', 'icon': 'shield', 'category': 'SECURITY'},
    {'name': 'Balcon', 'icon': 'balcony', 'category': 'EXTERIOR'},
    {'name': 'Cuisine équipée', 'icon': 'kitchen', 'category': 'COMFORT'},
    {'name': 'Eau courante', 'icon': 'droplet', 'category': 'COMFORT'},
    {'name': 'Groupe électrogène', 'icon': 'zap', 'category': 'COMFORT'},
]

PROPERTY_SPECS = [
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Studio meublé Bastos',
        'description': (
            'Studio lumineux entièrement meublé, idéal pour jeune actif. '
            'Proche ambassades et commerces. Eau et électricité incluses.'
        ),
        'type': 'STUDIO',
        'surface': 28,
        'number_of_rooms': 2,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': True,
        'monthly_rent': Decimal('180000'),
        'charges': Decimal('15000'),
        'charges_included': True,
        'deposit': Decimal('360000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Rue 1.750 Bastos',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Bastos',
            'latitude': 3.8667,
            'longitude': 11.5167,
        },
        'amenity_names': ['Internet fibre', 'Climatisation', 'Parking privé', 'Gardien 24h/24'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Appartement F3 Odza',
        'description': (
            'Bel appartement familial au calme, 3 chambres, salon spacieux, '
            'cuisine séparée. Quartier résidentiel avec accès facile au centre-ville.'
        ),
        'type': 'APARTMENT',
        'surface': 95,
        'number_of_rooms': 5,
        'number_of_bedrooms': 3,
        'number_of_bathrooms': 2,
        'furnished': False,
        'monthly_rent': Decimal('320000'),
        'charges': Decimal('25000'),
        'charges_included': False,
        'deposit': Decimal('640000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Carrefour Odza',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Odza',
            'latitude': 3.8480,
            'longitude': 11.5520,
        },
        'amenity_names': ['Eau courante', 'Balcon', 'Parking privé'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Villa 4 chambres Essos',
        'description': (
            'Grande villa avec jardin, garage double et dépendance. '
            'Parfaite pour famille expatriée ou cadre supérieur.'
        ),
        'type': 'HOUSE',
        'surface': 220,
        'number_of_rooms': 8,
        'number_of_bedrooms': 4,
        'number_of_bathrooms': 3,
        'furnished': True,
        'monthly_rent': Decimal('850000'),
        'charges': Decimal('50000'),
        'charges_included': False,
        'deposit': Decimal('1700000'),
        'status': 'PENDING',
        'address': {
            'street_address': 'Quartier Essos',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Essos',
            'latitude': 3.8900,
            'longitude': 11.5300,
        },
        'amenity_names': ['Climatisation', 'Gardien 24h/24', 'Parking privé', 'Groupe électrogène'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Chambre étudiant Mvan',
        'description': 'Chambre individuelle dans résidence sécurisée, proche université. WiFi inclus.',
        'type': 'ROOM',
        'surface': 14,
        'number_of_rooms': 1,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': True,
        'monthly_rent': Decimal('75000'),
        'charges': Decimal('10000'),
        'charges_included': True,
        'deposit': Decimal('150000'),
        'status': 'APPROVED',
        'address': {
            'street_address': 'Campus Mvan',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Mvan',
            'latitude': 3.8200,
            'longitude': 11.4800,
        },
        'amenity_names': ['Internet fibre', 'Eau courante'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Appartement Bonapriso Douala',
        'description': (
            'Appartement haut standing avec vue mer, sécurité 24h, '
            'proche restaurants et plage. Idéal expatriés.'
        ),
        'type': 'APARTMENT',
        'surface': 110,
        'number_of_rooms': 4,
        'number_of_bedrooms': 2,
        'number_of_bathrooms': 2,
        'floor': 5,
        'furnished': True,
        'monthly_rent': Decimal('550000'),
        'charges': Decimal('40000'),
        'charges_included': True,
        'deposit': Decimal('1100000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Boulevard de la Liberté',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Bonapriso',
            'latitude': 4.0511,
            'longitude': 9.7085,
        },
        'amenity_names': ['Climatisation', 'Internet fibre', 'Gardien 24h/24', 'Parking privé'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Studio Akwa centre-ville',
        'description': 'Studio rénové en plein centre d\'Akwa, commerces et transports à proximité.',
        'type': 'STUDIO',
        'surface': 32,
        'number_of_rooms': 2,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': False,
        'monthly_rent': Decimal('145000'),
        'charges': Decimal('12000'),
        'charges_included': False,
        'deposit': Decimal('290000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Rue Joss',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Akwa',
            'latitude': 4.0483,
            'longitude': 9.7043,
        },
        'amenity_names': ['Eau courante', 'Balcon'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Maison Bonamoussadi',
        'description': 'Maison plain-pied avec cour, à finaliser avant publication.',
        'type': 'HOUSE',
        'surface': 150,
        'number_of_rooms': 6,
        'number_of_bedrooms': 3,
        'number_of_bathrooms': 2,
        'furnished': False,
        'monthly_rent': Decimal('400000'),
        'charges': Decimal('20000'),
        'charges_included': False,
        'deposit': Decimal('800000'),
        'status': 'DRAFT',
        'address': {
            'street_address': 'Bonamoussadi',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Bonamoussadi',
            'latitude': 4.0900,
            'longitude': 9.7400,
        },
        'amenity_names': ['Parking privé'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'F2 Makepe (rejeté — photos floues)',
        'description': 'Appartement F2 en attente de nouvelles photos conformes.',
        'type': 'APARTMENT',
        'surface': 55,
        'number_of_rooms': 3,
        'number_of_bedrooms': 2,
        'number_of_bathrooms': 1,
        'furnished': False,
        'monthly_rent': Decimal('200000'),
        'charges': Decimal('15000'),
        'charges_included': False,
        'deposit': Decimal('400000'),
        'status': 'REJECTED',
        'rejection_reason': 'Photos de mauvaise qualité, merci de republier des images nettes.',
        'address': {
            'street_address': 'Makepe',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Makepe',
            'latitude': 4.0700,
            'longitude': 9.7600,
        },
        'amenity_names': ['Eau courante'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'F2 Nlongkak centre',
        'description': (
            'Appartement F2 rénové, proche ministères et supermarchés. '
            'Salon + chambre, cuisine américaine, bon standing.'
        ),
        'type': 'APARTMENT',
        'surface': 52,
        'number_of_rooms': 3,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': True,
        'monthly_rent': Decimal('195000'),
        'charges': Decimal('18000'),
        'charges_included': True,
        'deposit': Decimal('390000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Avenue Kennedy',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Nlongkak',
            'latitude': 3.8570,
            'longitude': 11.5210,
        },
        'amenity_names': ['Internet fibre', 'Climatisation', 'Cuisine équipée'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Duplex Golf résidentiel',
        'description': (
            'Duplex spacieux dans quartier huppé du Golf. '
            'Double salon, terrasse, vue dégagée. Résidence sécurisée.'
        ),
        'type': 'APARTMENT',
        'surface': 140,
        'number_of_rooms': 6,
        'number_of_bedrooms': 3,
        'number_of_bathrooms': 2,
        'floor': 3,
        'furnished': True,
        'monthly_rent': Decimal('620000'),
        'charges': Decimal('45000'),
        'charges_included': False,
        'deposit': Decimal('1240000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Quartier Golf',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Golf',
            'latitude': 3.8750,
            'longitude': 11.5050,
        },
        'amenity_names': ['Climatisation', 'Gardien 24h/24', 'Parking privé', 'Balcon'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Studio Obili université',
        'description': 'Petit studio fonctionnel à deux pas du campus. Idéal étudiant ou stagiaire.',
        'type': 'STUDIO',
        'surface': 22,
        'number_of_rooms': 1,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': True,
        'monthly_rent': Decimal('65000'),
        'charges': Decimal('8000'),
        'charges_included': True,
        'deposit': Decimal('130000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Carrefour Obili',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Obili',
            'latitude': 3.8350,
            'longitude': 11.4950,
        },
        'amenity_names': ['Internet fibre', 'Eau courante'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Maison 3 chambres Nkomo',
        'description': (
            'Maison individuelle avec cour arborée, garage et buanderie. '
            'Quartier calme, accès goudronné.'
        ),
        'type': 'HOUSE',
        'surface': 130,
        'number_of_rooms': 5,
        'number_of_bedrooms': 3,
        'number_of_bathrooms': 2,
        'furnished': False,
        'monthly_rent': Decimal('380000'),
        'charges': Decimal('22000'),
        'charges_included': False,
        'deposit': Decimal('760000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Nkomo',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Nkomo',
            'latitude': 3.8100,
            'longitude': 11.4650,
        },
        'amenity_names': ['Parking privé', 'Eau courante', 'Groupe électrogène'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'Appartement Mendong standing',
        'description': 'Bel F3 en immeuble récent, ascenseur, interphone. En attente de validation admin.',
        'type': 'APARTMENT',
        'surface': 78,
        'number_of_rooms': 4,
        'number_of_bedrooms': 2,
        'number_of_bathrooms': 2,
        'floor': 2,
        'furnished': True,
        'monthly_rent': Decimal('275000'),
        'charges': Decimal('20000'),
        'charges_included': True,
        'deposit': Decimal('550000'),
        'status': 'PENDING',
        'address': {
            'street_address': 'Mendong',
            'city': 'Yaoundé',
            'postal_code': '00237',
            'district': 'Mendong',
            'latitude': 3.8280,
            'longitude': 11.5100,
        },
        'amenity_names': ['Climatisation', 'Gardien 24h/24', 'Internet fibre'],
    },
    {
        'landlord_email': f'marie.proprio{DEMO_DOMAIN}',
        'title': 'F3 Bafoussam centre-ville',
        'description': 'Appartement familial au cœur de Bafoussam, marché et écoles à proximité.',
        'type': 'APARTMENT',
        'surface': 85,
        'number_of_rooms': 4,
        'number_of_bedrooms': 2,
        'number_of_bathrooms': 1,
        'furnished': False,
        'monthly_rent': Decimal('165000'),
        'charges': Decimal('12000'),
        'charges_included': False,
        'deposit': Decimal('330000'),
        'status': 'RENTED',
        'address': {
            'street_address': 'Avenue du Marché',
            'city': 'Bafoussam',
            'postal_code': '00237',
            'district': 'Centre',
            'latitude': 5.4780,
            'longitude': 10.4170,
        },
        'amenity_names': ['Eau courante', 'Balcon'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Villa Bonanjo vue mer',
        'description': (
            'Villa de prestige avec piscine et jardin tropical. '
            'Quartier diplomatique, sécurité renforcée.'
        ),
        'type': 'HOUSE',
        'surface': 280,
        'number_of_rooms': 10,
        'number_of_bedrooms': 5,
        'number_of_bathrooms': 4,
        'furnished': True,
        'monthly_rent': Decimal('1200000'),
        'charges': Decimal('80000'),
        'charges_included': False,
        'deposit': Decimal('2400000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Bonanjo',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Bonanjo',
            'latitude': 4.0450,
            'longitude': 9.6950,
        },
        'amenity_names': ['Climatisation', 'Gardien 24h/24', 'Parking privé', 'Groupe électrogène'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Studio Deido économique',
        'description': 'Studio accessible, proche gare routière et commerces de Deido.',
        'type': 'STUDIO',
        'surface': 25,
        'number_of_rooms': 1,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': False,
        'monthly_rent': Decimal('85000'),
        'charges': Decimal('7000'),
        'charges_included': False,
        'deposit': Decimal('170000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Deido',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Deido',
            'latitude': 4.0650,
            'longitude': 9.7150,
        },
        'amenity_names': ['Eau courante'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'F4 Logpom familial',
        'description': (
            'Grand F4 lumineux, 3 chambres + bureau. '
            'Proche écoles internationales et centres commerciaux.'
        ),
        'type': 'APARTMENT',
        'surface': 120,
        'number_of_rooms': 5,
        'number_of_bedrooms': 3,
        'number_of_bathrooms': 2,
        'furnished': True,
        'monthly_rent': Decimal('420000'),
        'charges': Decimal('30000'),
        'charges_included': True,
        'deposit': Decimal('840000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'Logpom',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Logpom',
            'latitude': 4.0550,
            'longitude': 9.7350,
        },
        'amenity_names': ['Climatisation', 'Internet fibre', 'Parking privé', 'Cuisine équipée'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Chambre colocation PK12',
        'description': 'Chambre meublée dans colocation étudiante, WiFi et ménage inclus.',
        'type': 'ROOM',
        'surface': 12,
        'number_of_rooms': 1,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': True,
        'monthly_rent': Decimal('55000'),
        'charges': Decimal('5000'),
        'charges_included': True,
        'deposit': Decimal('110000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'PK12',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'PK12',
            'latitude': 4.0200,
            'longitude': 9.7800,
        },
        'amenity_names': ['Internet fibre', 'Eau courante'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Appartement New Bell',
        'description': 'F2 rénové dans quartier populaire dynamique, transports en commun à proximité.',
        'type': 'APARTMENT',
        'surface': 48,
        'number_of_rooms': 3,
        'number_of_bedrooms': 1,
        'number_of_bathrooms': 1,
        'furnished': False,
        'monthly_rent': Decimal('120000'),
        'charges': Decimal('10000'),
        'charges_included': False,
        'deposit': Decimal('240000'),
        'status': 'PUBLISHED',
        'address': {
            'street_address': 'New Bell',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'New Bell',
            'latitude': 4.0380,
            'longitude': 9.7280,
        },
        'amenity_names': ['Eau courante', 'Balcon'],
    },
    {
        'landlord_email': f'paul.proprio{DEMO_DOMAIN}',
        'title': 'Maison Yassa bord de mer',
        'description': 'Maison avec terrasse vue lagune, brouillon en cours de finalisation.',
        'type': 'HOUSE',
        'surface': 175,
        'number_of_rooms': 7,
        'number_of_bedrooms': 4,
        'number_of_bathrooms': 2,
        'furnished': True,
        'monthly_rent': Decimal('480000'),
        'charges': Decimal('25000'),
        'charges_included': False,
        'deposit': Decimal('960000'),
        'status': 'DRAFT',
        'address': {
            'street_address': 'Yassa',
            'city': 'Douala',
            'postal_code': '00237',
            'district': 'Yassa',
            'latitude': 4.0100,
            'longitude': 9.7500,
        },
        'amenity_names': ['Parking privé', 'Balcon'],
    },
]


class Command(BaseCommand):
    help = 'Crée des utilisateurs, annonces et interactions de démonstration (@demo.homify.cm).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Supprime les données demo existantes avant de recréer.',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self._clear_demo_data()

        with transaction.atomic():
            users = self._seed_users()
            amenities = self._seed_amenities()
            properties = self._seed_properties(users, amenities)
            self._seed_favorites(users, properties)
            messages = self._seed_messages(users, properties)
            self._seed_notifications(users, properties, messages)
            self._seed_reports(users, properties)

        self.stdout.write(self.style.SUCCESS('\n✅ Données demo créées avec succès.\n'))
        self._print_summary(users, properties)

    def _clear_demo_data(self):
        count, _ = User.objects.filter(email__endswith=DEMO_DOMAIN).delete()
        self.stdout.write(self.style.WARNING(f'Suppression de {count} enregistrements demo.'))

    def _seed_users(self):
        users = {}
        for spec in DEMO_USERS:
            user, created = User.objects.get_or_create(
                email=spec['email'],
                defaults={
                    'first_name': spec['first_name'],
                    'last_name': spec['last_name'],
                    'phone': spec['phone'],
                    'role': spec['role'],
                    'email_verified': True,
                    'status': 'ACTIVE',
                    'is_staff': spec.get('is_staff', False),
                    'is_superuser': spec.get('is_superuser', False),
                },
            )
            if created or not user.check_password(DEMO_PASSWORD):
                user.set_password(DEMO_PASSWORD)
                user.save(update_fields=['password'])
            users[spec['email']] = user
            NotificationPreference.objects.get_or_create(user=user)
        return users

    def _seed_amenities(self):
        result = {}
        for spec in AMENITIES:
            amenity, _ = Amenity.objects.get_or_create(
                name=spec['name'],
                defaults={'icon': spec['icon'], 'category': spec['category']},
            )
            result[spec['name']] = amenity
        return result

    def _seed_properties(self, users, amenities):
        now = timezone.now()
        properties = []

        for raw_spec in PROPERTY_SPECS:
            spec = dict(raw_spec)
            landlord = users[spec.pop('landlord_email')]
            address_data = spec.pop('address')
            amenity_names = spec.pop('amenity_names')
            rejection_reason = spec.pop('rejection_reason', '')

            prop, created = Property.objects.get_or_create(
                landlord=landlord,
                title=spec['title'],
                defaults={
                    **spec,
                    'rejection_reason': rejection_reason,
                    'published_at': now if spec['status'] == 'PUBLISHED' else None,
                },
            )
            if not created:
                for field, value in spec.items():
                    setattr(prop, field, value)
                prop.rejection_reason = rejection_reason
                if spec['status'] == 'PUBLISHED' and not prop.published_at:
                    prop.published_at = now
                prop.save()

            Address.objects.update_or_create(
                property=prop,
                defaults=address_data,
            )
            prop.amenities.set([amenities[name] for name in amenity_names])
            properties.append(prop)

        return properties

    def _seed_favorites(self, users, properties):
        tenant_sophie = users[f'sophie.loc{DEMO_DOMAIN}']
        tenant_jean = users[f'jean.loc{DEMO_DOMAIN}']
        tenant_aminata = users[f'aminata.loc{DEMO_DOMAIN}']

        published = [p for p in properties if p.status == 'PUBLISHED']

        for prop in published[:7]:
            Favorite.objects.get_or_create(user=tenant_sophie, property=prop)
        for prop in published[3:10]:
            Favorite.objects.get_or_create(user=tenant_jean, property=prop)
        for prop in published[::3]:
            Favorite.objects.get_or_create(user=tenant_aminata, property=prop)

    def _seed_messages(self, users, properties):
        tenant_sophie = users[f'sophie.loc{DEMO_DOMAIN}']
        tenant_jean = users[f'jean.loc{DEMO_DOMAIN}']
        tenant_aminata = users[f'aminata.loc{DEMO_DOMAIN}']
        landlord_marie = users[f'marie.proprio{DEMO_DOMAIN}']
        landlord_paul = users[f'paul.proprio{DEMO_DOMAIN}']

        published = [p for p in properties if p.status == 'PUBLISHED']
        if len(published) < 2:
            return []

        studio_bastos = next(p for p in published if 'Bastos' in p.title)
        bonapriso = next(p for p in published if 'Bonapriso' in p.title)
        odza = next((p for p in published if 'Odza' in p.title), published[0])

        threads = [
            {
                'property': studio_bastos,
                'messages': [
                    (tenant_sophie, landlord_marie, 'Contact — Studio Bastos',
                     'Bonjour, ce studio est-il toujours disponible pour une visite cette semaine ?', False),
                    (landlord_marie, tenant_sophie, 'Re: Studio Bastos',
                     'Bonjour Sophie, oui il est disponible. Je peux vous proposer jeudi à 15h.', True),
                    (tenant_sophie, landlord_marie, 'Re: Studio Bastos',
                     'Parfait, jeudi 15h me convient. À quelle adresse exacte dois-je me présenter ?', False),
                ],
            },
            {
                'property': bonapriso,
                'messages': [
                    (tenant_jean, landlord_paul, 'Contact — Bonapriso',
                     'Bonjour, je suis intéressé par l\'appartement Bonapriso. Le loyer inclut-il les charges ?', False),
                    (landlord_paul, tenant_jean, 'Re: Bonapriso',
                     'Bonjour Jean, oui les charges sont incluses dans le montant affiché.', False),
                ],
            },
            {
                'property': odza,
                'messages': [
                    (tenant_aminata, landlord_marie, 'Contact — Odza',
                     'Bonjour, l\'appartement Odza accepte-t-il les familles avec enfants ? Merci.', False),
                    (landlord_marie, tenant_aminata, 'Re: Odza',
                     'Bonjour Aminata, oui tout à fait, le quartier est très adapté aux familles.', False),
                ],
            },
        ]

        created_messages = []
        for thread in threads:
            for sender, recipient, subject, content, is_read in thread['messages']:
                msg, _ = Message.objects.get_or_create(
                    property=thread['property'],
                    sender=sender,
                    recipient=recipient,
                    subject=subject,
                    defaults={'content': content, 'is_read': is_read},
                )
                if not msg.is_read and is_read:
                    msg.is_read = True
                    msg.read_at = timezone.now()
                    msg.save(update_fields=['is_read', 'read_at'])
                created_messages.append(msg)

        return created_messages

    def _seed_notifications(self, users, properties, messages):
        tenant_sophie = users[f'sophie.loc{DEMO_DOMAIN}']
        landlord_marie = users[f'marie.proprio{DEMO_DOMAIN}']
        landlord_paul = users[f'paul.proprio{DEMO_DOMAIN}']

        pending = next((p for p in properties if p.status == 'PENDING'), None)
        approved = next((p for p in properties if p.status == 'APPROVED'), None)

        if messages:
            reply = next((m for m in messages if m.recipient == tenant_sophie), None)
            if reply:
                Notification.objects.get_or_create(
                    user=tenant_sophie,
                    notification_type='MESSAGE',
                    title='Nouveau message',
                    body=f'{reply.sender.first_name} vous a répondu concernant {reply.property.title}.',
                    defaults={
                        'related_property': reply.property,
                        'message': reply,
                    },
                )

        if pending:
            Notification.objects.get_or_create(
                user=landlord_marie,
                notification_type='SYSTEM',
                title='Annonce en modération',
                body=f'Votre annonce « {pending.title} » est en cours d\'examen.',
                defaults={'related_property': pending},
            )

        if approved:
            Notification.objects.get_or_create(
                user=landlord_marie,
                notification_type='PROPERTY_APPROVED',
                title='Annonce approuvée',
                body=f'« {approved.title} » a été approuvée. Vous pouvez la publier.',
                defaults={'related_property': approved},
            )

        rejected = next((p for p in properties if p.status == 'REJECTED'), None)
        if rejected:
            Notification.objects.get_or_create(
                user=landlord_paul,
                notification_type='PROPERTY_REJECTED',
                title='Annonce rejetée',
                body=f'« {rejected.title} » a été rejetée : {rejected.rejection_reason}',
                defaults={'related_property': rejected},
            )

    def _seed_reports(self, users, properties):
        tenant_aminata = users[f'aminata.loc{DEMO_DOMAIN}']
        rejected = next((p for p in properties if p.status == 'REJECTED'), None)
        if not rejected:
            return

        Report.objects.get_or_create(
            reporter=tenant_aminata,
            property=rejected,
            reason='DUPLICATE',
            defaults={
                'description': 'Cette annonce semble être un doublon d\'une autre publication récente.',
                'status': 'PENDING',
            },
        )

    def _print_summary(self, users, properties):
        self.stdout.write('Comptes demo (mot de passe : Demo1234!)')
        self.stdout.write('─' * 50)
        for spec in DEMO_USERS:
            role_label = spec['role'].lower()
            self.stdout.write(f"  {spec['email']:<35} ({role_label})")

        published = sum(1 for p in properties if p.status == 'PUBLISHED')
        self.stdout.write('')
        self.stdout.write(f'Annonces : {len(properties)} total · {published} publiées')
        self.stdout.write(f'Favoris  : {Favorite.objects.filter(user__email__endswith=DEMO_DOMAIN).count()}')
        self.stdout.write(f'Messages : {Message.objects.filter(sender__email__endswith=DEMO_DOMAIN).count()}')
        self.stdout.write('')
        self.stdout.write('Connexion frontend : http://localhost:5173')
        self.stdout.write('Admin modération   : http://localhost:5173/admin (admin@demo.homify.cm)')

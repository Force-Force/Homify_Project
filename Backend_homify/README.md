# Backend Django - Plateforme de Location Immobilière

API REST complète pour une plateforme de location immobilière avec authentification JWT, gestion des annonces, favoris, messages et modération.

## 🚀 Démarrage rapide avec Docker

### Prérequis

- Docker
- Docker Compose

### Installation

1. **Cloner le projet** (ou extraire le ZIP)

2. **Lancer les conteneurs**

\`\`\`bash
docker-compose up -d
\`\`\`

Cette commande va :
- Créer la base de données PostgreSQL
- Créer le serveur Redis
- Installer toutes les dépendances Python
- Lancer les migrations
- Démarrer le serveur Django sur http://localhost:8000

3. **Créer un superutilisateur (admin)**

\`\`\`bash
docker-compose exec web python manage.py createsuperuser
\`\`\`

Suivez les instructions pour créer votre compte admin.

4. **Accéder à l'application**

- **API**: http://localhost:8000/api/
- **Documentation Swagger**: http://localhost:8000/api/docs/
- **Admin Django**: http://localhost:8000/admin/

### Commandes utiles

\`\`\`bash
# Voir les logs
docker-compose logs -f web

# Arrêter les conteneurs
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime la base de données)
docker-compose down -v

# Exécuter des commandes Django
docker-compose exec web python manage.py <commande>

# Créer des migrations
docker-compose exec web python manage.py makemigrations

# Appliquer les migrations
docker-compose exec web python manage.py migrate

# Créer des données de test
docker-compose exec web python manage.py shell
\`\`\`

## 📁 Structure du projet

\`\`\`
rental_project/
├── apps/
│   ├── users/          # Gestion des utilisateurs et authentification
│   ├── properties/     # Gestion des annonces immobilières
│   ├── amenities/      # Équipements (WiFi, Parking, etc.)
│   ├── favorites/      # Favoris des utilisateurs
│   ├── messages/       # Messagerie entre utilisateurs
│   └── reports/        # Signalements
├── rental_project/     # Configuration Django
│   ├── settings.py     # Configuration principale
│   ├── urls.py         # Routes principales
│   └── wsgi.py         # Point d'entrée WSGI
├── media/              # Fichiers uploadés (photos)
├── staticfiles/        # Fichiers statiques collectés
├── Dockerfile          # Configuration Docker
├── docker-compose.yml  # Orchestration des services
├── requirements.txt    # Dépendances Python
├── manage.py           # CLI Django
├── API_DOCUMENTATION.md # Documentation complète de l'API
└── README.md           # Ce fichier
\`\`\`

## 🔑 Fonctionnalités principales

### Authentification
- ✅ Inscription avec validation (email, mot de passe fort)
- ✅ Connexion JWT (access + refresh tokens)
- ✅ Gestion du profil utilisateur
- ✅ Changement de mot de passe
- ✅ 4 rôles: Visiteur, Locataire, Propriétaire, Admin

### Annonces immobilières
- ✅ CRUD complet des annonces
- ✅ Upload de photos (3-10 par annonce)
- ✅ Recherche avancée avec filtres (prix, type, ville, surface, etc.)
- ✅ Tri (date, prix, surface, popularité)
- ✅ Pagination (12 résultats par page)
- ✅ Compteur de vues
- ✅ Annonces similaires
- ✅ Statuts: Brouillon, En attente, Publié, Loué, Rejeté

### Favoris
- ✅ Ajouter/retirer des annonces en favoris
- ✅ Liste des favoris de l'utilisateur

### Messagerie
- ✅ Envoyer des messages aux propriétaires
- ✅ Boîte de réception / Messages envoyés
- ✅ Marquer comme lu
- ✅ Compteur de messages non lus
- ✅ Limite: 3 messages par annonce par 24h

### Signalements
- ✅ Signaler une annonce ou un utilisateur
- ✅ Raisons: Fraude, Contenu inapproprié, Doublon, Autre
- ✅ Gestion admin: Résoudre/Rejeter

### Administration
- ✅ Modération des annonces (Approuver/Rejeter)
- ✅ Gestion des utilisateurs (Suspendre/Réactiver)
- ✅ Gestion des signalements
- ✅ Interface admin Django complète

## 🗄️ Modèles de données

### User
- Email, mot de passe (hashé)
- Nom, prénom, téléphone
- Rôle (TENANT, LANDLORD, ADMIN)
- Statut (ACTIVE, SUSPENDED, DELETED)

### Property
- Titre, description, type (HOUSE, APARTMENT, STUDIO, ROOM)
- Caractéristiques (surface, pièces, chambres, étage, meublé)
- Tarification (loyer, charges, caution, frais d'agence)
- Statut (DRAFT, PENDING, PUBLISHED, RENTED, REJECTED, DELETED)
- Compteur de vues

### Address
- Adresse complète, ville, code postal, quartier
- Coordonnées GPS (latitude, longitude)

### Photo
- Image, miniature
- Photo principale, ordre

### Amenity
- Nom, icône, catégorie (COMFORT, SECURITY, CONNECTIVITY, EXTERIOR)

### Favorite
- Utilisateur + Propriété

### Message
- Expéditeur, destinataire, propriété
- Sujet, contenu
- Lu/Non lu, dates

### Report
- Rapporteur, propriété/utilisateur signalé
- Raison, description, statut

## 🔐 Sécurité

- ✅ Authentification JWT avec refresh tokens
- ✅ Mots de passe hashés avec bcrypt
- ✅ Validation stricte des données
- ✅ Permissions par rôle
- ✅ Protection CSRF
- ✅ CORS configuré
- ✅ Numéros de téléphone masqués
- ✅ Soft delete (conservation des données)

## 📊 API Endpoints

Consultez le fichier **API_DOCUMENTATION.md** pour la documentation complète de tous les endpoints.

### Résumé des endpoints principaux

**Authentification**
- POST `/api/auth/register/` - Inscription
- POST `/api/auth/login/` - Connexion
- POST `/api/auth/refresh/` - Rafraîchir le token
- GET `/api/auth/me/` - Mon profil
- PUT `/api/auth/me/` - Modifier mon profil
- POST `/api/auth/me/password/` - Changer mot de passe

**Annonces**
- GET `/api/properties/` - Liste des annonces (avec filtres)
- GET `/api/properties/{id}/` - Détails d'une annonce
- POST `/api/properties/` - Créer une annonce
- PUT `/api/properties/{id}/` - Modifier une annonce
- DELETE `/api/properties/{id}/` - Supprimer une annonce
- GET `/api/properties/my_properties/` - Mes annonces
- POST `/api/properties/{id}/upload_photos/` - Upload photos
- GET `/api/properties/{id}/similar/` - Annonces similaires

**Favoris**
- GET `/api/favorites/` - Mes favoris
- POST `/api/favorites/` - Ajouter aux favoris
- DELETE `/api/favorites/{property_id}/` - Retirer des favoris

**Messages**
- GET `/api/messages/` - Tous mes messages
- GET `/api/messages/inbox/` - Messages reçus
- GET `/api/messages/sent/` - Messages envoyés
- POST `/api/messages/` - Envoyer un message
- POST `/api/messages/{id}/mark_as_read/` - Marquer comme lu
- GET `/api/messages/unread_count/` - Nombre de non lus

**Équipements**
- GET `/api/amenities/` - Liste des équipements
- POST `/api/amenities/` - Créer (admin)

**Signalements**
- GET `/api/reports/` - Mes signalements
- POST `/api/reports/` - Créer un signalement
- POST `/api/reports/{id}/resolve/` - Résoudre (admin)
- POST `/api/reports/{id}/dismiss/` - Rejeter (admin)

**Administration**
- GET `/api/auth/admin/users/` - Liste des utilisateurs
- POST `/api/auth/admin/users/{id}/suspend/` - Suspendre
- POST `/api/auth/admin/users/{id}/activate/` - Réactiver
- GET `/api/properties/admin/properties/pending/` - Annonces en attente
- POST `/api/properties/admin/properties/{id}/approve/` - Approuver
- POST `/api/properties/admin/properties/{id}/reject/` - Rejeter

## 🧪 Tests

Pour tester l'API, vous pouvez utiliser :

1. **Swagger UI** (recommandé): http://localhost:8000/api/docs/
   - Interface interactive pour tester tous les endpoints
   - Documentation automatique

2. **cURL**
\`\`\`bash
# Exemple: Inscription
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "237612345678",
    "role": "TENANT"
  }'
\`\`\`

3. **Postman** ou **Insomnia**
   - Importez la collection depuis Swagger

4. **Python requests**
\`\`\`python
import requests

# Inscription
response = requests.post('http://localhost:8000/api/auth/register/', json={
    'email': 'test@example.com',
    'password': 'SecurePass123!',
    'password_confirm': 'SecurePass123!',
    'first_name': 'Test',
    'last_name': 'User',
    'phone': '237612345678',
    'role': 'TENANT'
})
print(response.json())

# Connexion
response = requests.post('http://localhost:8000/api/auth/login/', json={
    'email': 'test@example.com',
    'password': 'SecurePass123!'
})
tokens = response.json()
access_token = tokens['access']

# Requête authentifiée
headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get('http://localhost:8000/api/auth/me/', headers=headers)
print(response.json())
\`\`\`

## 📝 Créer des données de test

\`\`\`python
# Entrer dans le shell Django
docker-compose exec web python manage.py shell

# Créer des équipements
from apps.amenities.models import Amenity

amenities = [
    {'name': 'Internet', 'icon': 'wifi', 'category': 'CONNECTIVITY'},
    {'name': 'Climatisation', 'icon': 'air-conditioner', 'category': 'COMFORT'},
    {'name': 'Chauffage', 'icon': 'heater', 'category': 'COMFORT'},
    {'name': 'Parking', 'icon': 'car', 'category': 'EXTERIOR'},
    {'name': 'Jardin', 'icon': 'tree', 'category': 'EXTERIOR'},
    {'name': 'Balcon', 'icon': 'balcony', 'category': 'EXTERIOR'},
    {'name': 'Piscine', 'icon': 'pool', 'category': 'EXTERIOR'},
    {'name': 'Sécurité 24/7', 'icon': 'shield', 'category': 'SECURITY'},
]

for amenity_data in amenities:
    Amenity.objects.get_or_create(**amenity_data)

print("Équipements créés!")
\`\`\`

## 🌍 Variables d'environnement

Créez un fichier `.env` à la racine pour personnaliser la configuration :

\`\`\`env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=rental_db
DB_USER=rental_user
DB_PASSWORD=rental_password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Email (optionnel)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
\`\`\`

## 🚀 Déploiement en production

Pour déployer en production :

1. **Modifier les variables d'environnement**
   - `DEBUG=False`
   - Générer une nouvelle `SECRET_KEY`
   - Configurer `ALLOWED_HOSTS`
   - Configurer un vrai serveur email

2. **Utiliser un serveur WSGI**
   - Gunicorn recommandé
   - Modifier le CMD dans Dockerfile

3. **Configurer un reverse proxy**
   - Nginx recommandé
   - Gérer les fichiers statiques et media

4. **Sécurité**
   - HTTPS obligatoire
   - Configurer CORS correctement
   - Activer les protections Django

5. **Base de données**
   - Sauvegardes régulières
   - Monitoring

## 📚 Technologies utilisées

- **Django 4.2** - Framework web Python
- **Django REST Framework 3.14** - API REST
- **PostgreSQL 15** - Base de données
- **Redis 7** - Cache et Celery broker
- **JWT** - Authentification
- **Docker & Docker Compose** - Conteneurisation
- **Pillow** - Traitement d'images
- **drf-yasg** - Documentation Swagger

## 🤝 Contribution

Ce projet est un backend complet prêt à l'emploi. Pour contribuer :

1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Tester avec `docker-compose up`
4. Créer une Pull Request

## 📄 Licence

Ce projet est fourni tel quel pour des fins éducatives et de test.

## 📞 Support

Pour toute question :
- Consultez la documentation API complète dans `API_DOCUMENTATION.md`
- Utilisez l'interface Swagger à http://localhost:8000/api/docs/
- Vérifiez les logs avec `docker-compose logs -f web`

## ✅ Checklist de vérification

Après le démarrage, vérifiez que :

- [ ] Les conteneurs sont lancés : `docker-compose ps`
- [ ] La base de données est accessible
- [ ] L'API répond : http://localhost:8000/api/
- [ ] Swagger fonctionne : http://localhost:8000/api/docs/
- [ ] L'admin Django est accessible : http://localhost:8000/admin/
- [ ] Vous pouvez créer un superutilisateur
- [ ] Vous pouvez vous inscrire via l'API
- [ ] Vous pouvez vous connecter et obtenir un JWT

## 🎯 Prochaines étapes

1. Créer un superutilisateur admin
2. Créer des équipements via l'admin ou l'API
3. Créer des comptes de test (locataires et propriétaires)
4. Créer des annonces de test
5. Tester tous les endpoints via Swagger
6. Développer le frontend en utilisant cette API

Bon développement ! 🚀

# Documentation API - Plateforme de Location Immobilière

## Vue d'ensemble

Cette API REST fournit tous les endpoints nécessaires pour gérer une plateforme de location immobilière complète. Elle retourne uniquement du JSON et utilise JWT pour l'authentification.

**Base URL**: `http://localhost:8000/api/`

**Documentation interactive**: 
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

---

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization:

```
Authorization: Bearer <votre_token_jwt>
```

### Endpoints d'authentification

#### 1. Inscription (Register)
**POST** `/api/auth/register/`

Créer un nouveau compte utilisateur.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "237612345678",
  "role": "TENANT"
}
```

**Rôles disponibles**: `TENANT` (Locataire) ou `LANDLORD` (Propriétaire)

**Réponse** (201 Created):
```json
{
  "message": "Inscription réussie. Veuillez vérifier votre email.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "full_name": "Jean Dupont",
    "phone": "237612345678",
    "masked_phone": "XX XX XX 5678",
    "role": "TENANT",
    "status": "ACTIVE",
    "email_verified": false,
    "created_at": "2024-10-15T10:00:00Z"
  }
}
```

#### 2. Connexion (Login)
**POST** `/api/auth/login/`

Se connecter et obtenir les tokens JWT.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Réponse** (200 OK):
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 3. Rafraîchir le token
**POST** `/api/auth/refresh/`

Obtenir un nouveau token d'accès avec le refresh token.

**Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Réponse** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Gestion du profil utilisateur

### 4. Obtenir mon profil
**GET** `/api/auth/me/`

🔒 **Authentification requise**

**Réponse** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "full_name": "Jean Dupont",
  "phone": "237612345678",
  "role": "TENANT",
  "status": "ACTIVE",
  "email_verified": false,
  "created_at": "2024-10-15T10:00:00Z",
  "properties_count": 0
}
```

### 5. Modifier mon profil
**PUT/PATCH** `/api/auth/me/`

🔒 **Authentification requise**

**Body** (PATCH - champs optionnels):
```json
{
  "first_name": "Jean-Pierre",
  "phone": "237698765432"
}
```

### 6. Changer mon mot de passe
**POST** `/api/auth/me/password/`

🔒 **Authentification requise**

**Body**:
```json
{
  "old_password": "SecurePass123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirm": "NewSecurePass456!"
}
```

**Réponse** (200 OK):
```json
{
  "message": "Mot de passe modifié avec succès."
}
```

---

## Gestion des annonces (Properties)

### 7. Lister les annonces
**GET** `/api/properties/`

Liste toutes les annonces publiées avec pagination et filtres.

**Paramètres de requête**:
- `page` (int): Numéro de page (défaut: 1)
- `type` (string): Type de bien (HOUSE, APARTMENT, STUDIO, ROOM)
- `min_price` (decimal): Prix minimum
- `max_price` (decimal): Prix maximum
- `min_surface` (decimal): Surface minimum
- `city` (string): Ville
- `district` (string): Quartier
- `furnished` (boolean): Meublé (true/false)
- `number_of_rooms` (int): Nombre de pièces
- `number_of_bedrooms` (int): Nombre de chambres
- `search` (string): Recherche textuelle (titre, description, ville)
- `ordering` (string): Tri (-created_at, monthly_rent, -monthly_rent, surface, -view_count)

**Exemple**: `/api/properties/?city=Yaoundé&min_price=300000&max_price=500000&type=APARTMENT&ordering=-created_at`

**Réponse** (200 OK):
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Bel appartement 2 pièces centre-ville",
      "type": "APARTMENT",
      "monthly_rent": "450000.00",
      "surface": 45.0,
      "number_of_rooms": 2,mesagerie
      "address": {
        "id": 1,
        "street_address": "123 Avenue Charles de Gaulle",
        "city": "Yaoundé",
        "postal_code": "00237",
        "district": "Bastos",
        "latitude": 3.8667,
        "longitude": 11.5167,
        "full_address": "123 Avenue Charles de Gaulle, Bastos, Yaoundé, 00237"
      },
      "primary_photo": {
        "id": 1,
        "url": "http://localhost:8000/media/properties/2024/10/15/photo1.jpg",
        "thumbnail_url": "http://localhost:8000/media/properties/thumbnails/2024/10/15/photo1.jpg",
        "is_primary": true,
        "order": 0,
        "uploaded_at": "2024-10-15T10:30:00Z"
      },
      "furnished": true,
      "published_at": "2024-10-15T10:00:00Z",
      "is_favorite": false
    }
  ]
}
```

### 8. Détails d'une annonce
**GET** `/api/properties/{id}/`

Obtenir les détails complets d'une annonce. Incrémente automatiquement le compteur de vues.

**Réponse** (200 OK):
```json
{
  "id": 1,
  "title": "Bel appartement 2 pièces centre-ville",
  "description": "Magnifique appartement meublé situé en plein centre-ville...",
  "type": "APARTMENT",
  "surface": 45.0,
  "number_of_rooms": 2,
  "number_of_bedrooms": 1,
  "number_of_bathrooms": 1,
  "floor": 3,
  "furnished": true,
  "monthly_rent": "450000.00",
  "charges": "25000.00",
  "charges_included": false,
  "deposit": "900000.00",
  "agency_fees": "450000.00",
  "address": {
    "id": 1,
    "street_address": "123 Avenue Charles de Gaulle",
    "city": "Yaoundé",
    "postal_code": "00237",
    "district": "Bastos",
    "latitude": 3.8667,
    "longitude": 11.5167,
    "full_address": "123 Avenue Charles de Gaulle, Bastos, Yaoundé, 00237"
  },
  "photos": [
    {
      "id": 1,
      "url": "http://localhost:8000/media/properties/2024/10/15/photo1.jpg",
      "thumbnail_url": "http://localhost:8000/media/properties/thumbnails/2024/10/15/photo1.jpg",
      "is_primary": true,
      "order": 0,
      "uploaded_at": "2024-10-15T10:30:00Z"
    }
  ],
  "amenities": [
    {
      "id": 1,
      "name": "Internet",
      "icon": "wifi",
      "category": "CONNECTIVITY"
    },
    {
      "id": 5,
      "name": "Parking",
      "icon": "car",
      "category": "EXTERIOR"
    }
  ],
  "landlord": {
    "id": 2,
    "email": "landlord@example.com",
    "first_name": "Marie",
    "last_name": "D.",
    "full_name": "Marie D.",
    "phone": "237612345678",
    "masked_phone": "XX XX XX 5678",
    "role": "LANDLORD",
    "status": "ACTIVE",
    "email_verified": true,
    "created_at": "2024-09-01T08:00:00Z"
  },
  "view_count": 247,
  "status": "PUBLISHED",
  "published_at": "2024-10-15T10:00:00Z",
  "updated_at": "2024-10-15T14:30:00Z",
  "is_favorite": false
}
```

### 9. Créer une annonce
**POST** `/api/properties/`

🔒 **Authentification requise** (LANDLORD ou ADMIN)

**Body**:
```json
{
  "title": "Bel appartement 2 pièces centre-ville",
  "description": "Magnifique appartement meublé situé en plein centre-ville de Yaoundé, quartier Bastos. Proche de toutes commodités.",
  "type": "APARTMENT",
  "surface": 45.0,
  "number_of_rooms": 2,
  "number_of_bedrooms": 1,
  "number_of_bathrooms": 1,
  "floor": 3,
  "furnished": true,
  "monthly_rent": "450000.00",
  "charges": "25000.00",
  "charges_included": false,
  "deposit": "900000.00",
  "agency_fees": "450000.00",
  "address": {
    "street_address": "123 Avenue Charles de Gaulle",
    "city": "Yaoundé",
    "postal_code": "00237",
    "district": "Bastos",
    "latitude": 3.8667,
    "longitude": 11.5167
  },
  "amenity_ids": [1, 2, 5, 8],
  "status": "PENDING"
}
```

**Statuts disponibles**: `DRAFT` (brouillon), `PENDING` (en attente de modération)

**Réponse** (201 Created): Même structure que GET détails

### 10. Modifier une annonce
**PUT/PATCH** `/api/properties/{id}/`

🔒 **Authentification requise** (Propriétaire de l'annonce ou ADMIN)

**Body** (PATCH - champs optionnels):
```json
{
  "monthly_rent": "475000.00",
  "description": "Description mise à jour..."
}
```

### 11. Supprimer une annonce
**DELETE** `/api/properties/{id}/`

🔒 **Authentification requise** (Propriétaire de l'annonce ou ADMIN)

**Réponse** (204 No Content)

### 12. Mes annonces
**GET** `/api/properties/my_properties/`

🔒 **Authentification requise** (LANDLORD)

Liste toutes les annonces de l'utilisateur connecté (tous statuts).

**Réponse**: Même structure que la liste des annonces

### 13. Upload de photos
**POST** `/api/properties/{id}/upload_photos/`

🔒 **Authentification requise** (Propriétaire de l'annonce ou ADMIN)

**Body** (multipart/form-data):
- `photos`: Fichiers images (3 à 10 photos, max 5 Mo chacune)

**Réponse** (201 Created):
```json
[
  {
    "id": 10,
    "url": "http://localhost:8000/media/properties/2024/10/15/photo10.jpg",
    "thumbnail_url": "http://localhost:8000/media/properties/thumbnails/2024/10/15/photo10.jpg",
    "is_primary": false,
    "order": 3,
    "uploaded_at": "2024-10-15T15:00:00Z"
  }
]
```

### 14. Supprimer une photo
**DELETE** `/api/properties/{id}/photos/{photo_id}/`

🔒 **Authentification requise** (Propriétaire de l'annonce ou ADMIN)

**Réponse** (204 No Content)

### 15. Annonces similaires
**GET** `/api/properties/{id}/similar/`

Obtenir des annonces similaires (même type et ville).

**Réponse**: Liste de 6 annonces maximum (même structure que liste)

---

## Favoris

### 16. Lister mes favoris
**GET** `/api/favorites/`

🔒 **Authentification requise**

**Réponse** (200 OK):
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "property": {
        "id": 1,
        "title": "Bel appartement 2 pièces centre-ville",
        "type": "APARTMENT",
        "monthly_rent": "450000.00",
        "surface": 45.0,
        "number_of_rooms": 2,
        "address": {...},
        "primary_photo": {...},
        "furnished": true,
        "published_at": "2024-10-15T10:00:00Z",
        "is_favorite": true
      },
      "created_at": "2024-10-16T09:00:00Z"
    }
  ]
}
```

### 17. Ajouter aux favoris
**POST** `/api/favorites/`

🔒 **Authentification requise**

**Body**:
\`\`\`json
{
  "property_id": 1
}
\`\`\`

**Réponse** (201 Created):
\`\`\`json
{
  "id": 1,
  "property": {...},
  "created_at": "2024-10-16T09:00:00Z"
}
\`\`\`

### 18. Retirer des favoris
**DELETE** `/api/favorites/{property_id}/`

🔒 **Authentification requise**

**Réponse** (204 No Content)

---

## Messages

### 19. Lister tous mes messages
**GET** `/api/messages/`

🔒 **Authentification requise**

Liste tous les messages (envoyés et reçus).

**Réponse** (200 OK):
\`\`\`json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "property": 1,
      "property_detail": {
        "id": 1,
        "title": "Bel appartement 2 pièces centre-ville",
        "primary_photo": {...}
      },
      "sender": {
        "id": 1,
        "email": "tenant@example.com",
        "first_name": "Jean",
        "last_name": "Dupont",
        "full_name": "Jean Dupont",
        "masked_phone": "XX XX XX 5678",
        "role": "TENANT"
      },
      "recipient": {
        "id": 2,
        "email": "landlord@example.com",
        "first_name": "Marie",
        "last_name": "Martin",
        "full_name": "Marie Martin",
        "masked_phone": "XX XX XX 1234",
        "role": "LANDLORD"
      },
      "subject": "Demande d'informations - Bel appartement 2 pièces",
      "content": "Bonjour, je suis intéressé par votre annonce. Serait-il possible de visiter le bien cette semaine ?",
      "is_read": false,
      "sent_at": "2024-10-16T10:30:00Z",
      "read_at": null
    }
  ]
}
\`\`\`

### 20. Messages reçus (Boîte de réception)
**GET** `/api/messages/inbox/`

🔒 **Authentification requise**

**Réponse**: Même structure que liste des messages

### 21. Messages envoyés
**GET** `/api/messages/sent/`

🔒 **Authentification requise**

**Réponse**: Même structure que liste des messages

### 22. Envoyer un message
**POST** `/api/messages/`

🔒 **Authentification requise**

**Body**:
\`\`\`json
{
  "property_id": 1,
  "subject": "Demande d'informations",
  "content": "Bonjour, je suis intéressé par votre annonce. Serait-il possible de visiter le bien cette semaine ? Merci."
}
\`\`\`

**Contraintes**:
- Contenu: 20-1000 caractères
- Limite: 3 messages par annonce par utilisateur par 24h

**Réponse** (201 Created): Même structure qu'un message

### 23. Marquer comme lu
**POST** `/api/messages/{id}/mark_as_read/`

🔒 **Authentification requise** (Destinataire uniquement)

**Réponse** (200 OK): Message mis à jour

### 24. Nombre de messages non lus
**GET** `/api/messages/unread_count/`

🔒 **Authentification requise**

**Réponse** (200 OK):
\`\`\`json
{
  "unread_count": 3
}
\`\`\`

---

## Équipements (Amenities)

### 25. Lister les équipements
**GET** `/api/amenities/`

Liste tous les équipements disponibles.

**Réponse** (200 OK):
\`\`\`json
[
  {
    "id": 1,
    "name": "Internet",
    "icon": "wifi",
    "category": "CONNECTIVITY"
  },
  {
    "id": 2,
    "name": "Climatisation",
    "icon": "air-conditioner",
    "category": "COMFORT"
  },
  {
    "id": 3,
    "name": "Parking",
    "icon": "car",
    "category": "EXTERIOR"
  }
]
\`\`\`

**Catégories**: `COMFORT`, `SECURITY`, `CONNECTIVITY`, `EXTERIOR`

### 26. Créer un équipement
**POST** `/api/amenities/`

🔒 **Authentification requise** (ADMIN uniquement)

**Body**:
\`\`\`json
{
  "name": "Piscine",
  "icon": "pool",
  "category": "EXTERIOR"
}
\`\`\`

---

## Signalements (Reports)

### 27. Lister les signalements
**GET** `/api/reports/`

🔒 **Authentification requise**

- Utilisateurs normaux: Voient uniquement leurs propres signalements
- Admins: Voient tous les signalements

**Réponse** (200 OK):
\`\`\`json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "reporter": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "Jean",
        "last_name": "Dupont",
        "full_name": "Jean Dupont"
      },
      "property": 5,
      "property_detail": {
        "id": 5,
        "title": "Annonce suspecte",
        "primary_photo": {...}
      },
      "reported_user": null,
      "reported_user_detail": null,
      "reason": "FRAUD",
      "description": "Cette annonce semble être une arnaque. Les photos ne correspondent pas à la description.",
      "status": "PENDING",
      "created_at": "2024-10-16T11:00:00Z",
      "resolved_at": null
    }
  ]
}
\`\`\`

**Raisons**: `FRAUD`, `INAPPROPRIATE`, `DUPLICATE`, `OTHER`
**Statuts**: `PENDING`, `REVIEWED`, `RESOLVED`, `DISMISSED`

### 28. Créer un signalement
**POST** `/api/reports/`

🔒 **Authentification requise**

**Body** (signaler une annonce):
\`\`\`json
{
  "property": 5,
  "reason": "FRAUD",
  "description": "Cette annonce semble être une arnaque. Les photos ne correspondent pas à la description et le prix est anormalement bas."
}
\`\`\`

**Body** (signaler un utilisateur):
\`\`\`json
{
  "reported_user": 10,
  "reason": "INAPPROPRIATE",
  "description": "Cet utilisateur envoie des messages inappropriés."
}
\`\`\`

**Réponse** (201 Created): Signalement créé

### 29. Résoudre un signalement
**POST** `/api/reports/{id}/resolve/`

🔒 **Authentification requise** (ADMIN uniquement)

**Réponse** (200 OK):
\`\`\`json
{
  "message": "Signalement résolu.",
  "report": {...}
}
\`\`\`

### 30. Rejeter un signalement
**POST** `/api/reports/{id}/dismiss/`

🔒 **Authentification requise** (ADMIN uniquement)

**Réponse** (200 OK):
\`\`\`json
{
  "message": "Signalement rejeté.",
  "report": {...}
}
\`\`\`

---

## Administration

### 31. Lister les utilisateurs (Admin)
**GET** `/api/auth/admin/users/`

🔒 **Authentification requise** (ADMIN uniquement)

**Paramètres**:
- `role`: Filtrer par rôle (TENANT, LANDLORD, ADMIN)
- `status`: Filtrer par statut (ACTIVE, SUSPENDED, DELETED)
- `email_verified`: Filtrer par vérification email (true/false)
- `search`: Recherche par email, prénom, nom

**Réponse** (200 OK):
\`\`\`json
{
  "count": 150,
  "next": "http://localhost:8000/api/auth/admin/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "full_name": "Jean Dupont",
      "phone": "237612345678",
      "role": "TENANT",
      "status": "ACTIVE",
      "email_verified": true,
      "is_active": true,
      "created_at": "2024-09-01T10:00:00Z",
      "last_login_at": "2024-10-16T08:30:00Z",
      "properties_count": 0
    }
  ]
}
\`\`\`

### 32. Suspendre un utilisateur
**POST** `/api/auth/admin/users/{id}/suspend/`

🔒 **Authentification requise** (ADMIN uniquement)

**Réponse** (200 OK):
\`\`\`json
{
  "message": "Utilisateur user@example.com suspendu.",
  "user": {...}
}
\`\`\`

### 33. Réactiver un utilisateur
**POST** `/api/auth/admin/users/{id}/activate/`

🔒 **Authentification requise** (ADMIN uniquement)

**Réponse** (200 OK):
\`\`\`json
{
  "message": "Utilisateur user@example.com réactivé.",
  "user": {...}
}
\`\`\`

### 34. Annonces en attente de modération
**GET** `/api/properties/admin/properties/pending/`

🔒 **Authentification requise** (ADMIN uniquement)

**Réponse**: Liste des annonces avec status=PENDING

### 35. Approuver une annonce
**POST** `/api/properties/admin/properties/{id}/approve/`

🔒 **Authentification requise** (ADMIN uniquement)

Transition: `PENDING` → `APPROVED`. Envoie une notification email au propriétaire.

**Réponse** (200 OK):
```json
{
  "message": "Annonce approuvée.",
  "property": {...}
}
```

### 35b. Publier une annonce approuvée
**POST** `/api/properties/admin/properties/{id}/publish/`

🔒 **Authentification requise** (ADMIN uniquement)

Transition: `APPROVED` → `PUBLISHED`. Envoie une notification email au propriétaire.

**Réponse** (200 OK):
```json
{
  "message": "Annonce publiée.",
  "property": {...}
}
```

### 35c. Soumettre une annonce pour modération (propriétaire)
**POST** `/api/properties/{id}/submit_for_review/`

🔒 **Authentification requise** (LANDLORD propriétaire)

Transition: `DRAFT` ou `REJECTED` → `PENDING`. Requiert au minimum 3 photos.

**Réponse** (200 OK):
```json
{
  "message": "Annonce soumise pour modération.",
  "property": {...}
}
```

### 36. Rejeter une annonce
**POST** `/api/properties/admin/properties/{id}/reject/`

🔒 **Authentification requise** (ADMIN uniquement)

**Body** (optionnel):
\`\`\`json
{
  "reason": "Photos de mauvaise qualité. Veuillez uploader des photos plus claires."
}
\`\`\`

**Réponse** (200 OK):
\`\`\`json
{
  "message": "Annonce rejetée.",
  "property": {...}
}
\`\`\`

---

## Codes d'erreur HTTP

- **200 OK**: Requête réussie
- **201 Created**: Ressource créée avec succès
- **204 No Content**: Suppression réussie
- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Non authentifié
- **403 Forbidden**: Pas les permissions nécessaires
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

## Format des erreurs

```json
{
  "field_name": [
    "Message d'erreur détaillé"
  ]
}
```

Ou pour les erreurs générales:

```json
{
  "error": "Message d'erreur"
}
```

---

## Pagination

Toutes les listes sont paginées avec 12 éléments par page par défaut.

**Réponse paginée**:
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/properties/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Notes importantes

1. **Authentification**: La plupart des endpoints nécessitent un token JWT valide
2. **Permissions**: Certaines actions sont réservées aux propriétaires ou admins
3. **Validation**: Tous les champs sont validés côté serveur via la couche `apps.core.services`
4. **Soft Delete**: Les suppressions d'annonces et comptes utilisent le statut `DELETED` (données conservées)
5. **Modération en 2 étapes**: `approve` (→ APPROVED) puis `publish` (→ PUBLISHED)
6. **Rate Limiting**: Limite de 3 messages par annonce par utilisateur par 24h (enforced)
7. **Upload photos**: 3 à 10 photos par requête, max 5 Mo chacune, formats JPG/PNG ; thumbnails générés en async (Celery)
8. **Mots de passe**: Hashés avec bcrypt (BCryptSHA256)
9. **Signalements**: Workflow `PENDING` → `REVIEWED` → `RESOLVED`/`DISMISSED`
10. **Recherche**: Utilise la recherche full-text sur plusieurs champs

---

## Exemples d'utilisation

### Exemple 1: Recherche d'appartements à Yaoundé

```bash
curl -X GET "http://localhost:8000/api/properties/?city=Yaoundé&type=APARTMENT&min_price=300000&max_price=600000&ordering=-created_at"
```

### Exemple 2: Créer une annonce

```bash
curl -X POST "http://localhost:8000/api/properties/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Studio meublé Bastos",
    "description": "Joli studio meublé...",
    "type": "STUDIO",
    "surface": 25,
    "number_of_rooms": 1,
    "number_of_bedrooms": 1,
    "number_of_bathrooms": 1,
    "furnished": true,
    "monthly_rent": "250000",
    "charges": "15000",
    "deposit": "500000",
    "address": {
      "street_address": "Rue 1234",
      "city": "Yaoundé",
      "postal_code": "00237",
      "district": "Bastos"
    },
    "amenity_ids": [1, 2],
    "status": "PENDING"
  }'
```

### Exemple 3: Ajouter aux favoris

```bash
curl -X POST "http://localhost:8000/api/favorites/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"property_id": 1}'
```

---

## Support

Pour toute question ou problème, consultez la documentation interactive Swagger à `/api/docs/`.

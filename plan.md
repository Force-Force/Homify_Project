Backend — Perspectives d'amélioration (logique métier)
Architecture transversale ✅ (corrigé)
- Couche services : `apps/core/services/` (lifecycle, media, messaging, notifications, reports, users)
- Tâches Celery : `apps/core/tasks.py` (emails, thumbnails, notifications)
- États branchés : APPROVED (approve→publish), REVIEWED (review), DELETED (soft delete)
- Règles doc implémentées : rate limit messages, min 3 photos/upload, bcrypt, validation photos 5Mo JPG/PNG


Auth & Users ✅ (corrigé)
- JWT blacklist + révocation (suspend, delete, logout, reset/changement MDP)
- `HomifyJWTAuthentication` : status/is_active/email_verified à chaque requête
- Vérification email (token 24h) ; VISITOR jusqu'à verify → pending_role TENANT/LANDLORD
- Endpoints : verify-email, resend-verification, forgot/reset-password, logout, me/delete
- Admin : sync status/is_active, anti auto-suspension, audit trail (`UserAuditLog`)
- `last_login_at` mis à jour au login

Properties (annonces) ✅ (corrigé)
- Statut PUBLISHED/admin non modifiable par le landlord (read_only + transitions centralisées)
- rejection_reason stocké + notification email au rejet
- Validation photos : min 3 à la soumission, 5 Mo, JPG/PNG, max 10 par upload
- view_count dédupliqué (1 vue/jour/visiteur via PropertyViewRecord)
- Téléphone landlord masqué dans le détail public (LandlordPublicSerializer)
- Soft-delete (DELETED) + transition PUBLISHED → RENTED (mark_rented)
- Filtre number_of_bathrooms + recherche géo (lat, lng, radius_km)


Favorites ✅ (corrigé)
- Favoris masqués si annonce non PUBLISHED ; nettoyage auto via FavoriteService (reject/rented/delete)
- DELETE unifié : `DELETE /api/favorites/by-property/{property_id}/` (PK favori désactivé)

Chat / Messages ✅ (corrigé)
- Rate limit 3 msg/24h/propriété via MessagingPolicyService
- Messagerie bidirectionnelle : tenant → landlord, landlord → dernier locataire du fil
- Messages non modifiables ; suppression réservée à l'expéditeur
- Notification email async à la réception (Celery)

Reports (signalements) ✅ (corrigé)
- Workflow PENDING → REVIEWED → RESOLVED/DISMISSED (review obligatoire avant resolve/dismiss)
- Prévention doublons (même reporter + même cible ouverte)
- resolve avec actions : reject_property, unpublish_property, suspend_user
- Modération unifiée via ReportModerationService + PropertyLifecycleService/UserLifecycleService


Amenities ✅ (corrigé)
- Suppression protégée : bloquée si l'équipement est lié à des annonces (`amenity_in_use` + `properties_count`)
- Suppression explicite avec `DELETE /api/amenities/{id}/?force=true` (retourne `properties_affected`)
- `properties_count` exposé dans le serializer pour visibilité admin
- Filtre par catégorie : `GET /api/amenities/?category=COMFORT` (+ recherche `search`, tri `ordering`)


Frontend — Perspectives d'amélioration (logique métier)
Auth
Priorité	Problème	Fichiers
Critique
Token JWT jamais envoyé dans propertyService.ts (fetch sans Authorization)
propertyService.ts
Critique
Pas de refresh token — session expire silencieusement
routes.ts, main.tsx
Haute
Mot de passe oublié / social auth : UI existe, endpoints backend absents
ForgotPassword.tsx, HomifiSignIn.tsx
Haute
Profil hardcodé (Melissa Peters) — pas d'appel GET /auth/me/
ProfileScreen.tsx
Moyenne
rememberMe cosmétique, auth non réactive après login
HomifiSignIn.tsx
Moyenne
Rôle LANDLORD collecté à l'inscription, aucune UX propriétaire
HomifiSignUp.tsx, App.tsx
Properties
Priorité	Problème
Haute
Détail = données de la liste en mémoire — pas de GET /properties/{id}/
Haute
Rating 4.5 hardcodé, description synthétique, une seule photo
Haute
Chambres souvent à 0 (champ absent du list serializer backend)
Moyenne
Pagination ignorée — seule la 1ère page affichée
Moyenne
Filtres incomplets vs backend (furnished, bathrooms, district, surface…)
Moyenne
WhatsApp avec numéro statique 237600000000
Basse
Galerie, Share, Avis = stubs
Favorites
Cœurs sur les cartes = état local uniquement — addToFavorites/removeFromFavorites jamais appelés
API favorites retourne 401 sans token → liste vide sans message d'erreur clair
Pas de désynchronisation entre Home et Favoris
Navigation
Pas de deep linking (/property/42) — refresh perd le contexte
Onglets Search et Assist identiques (tous deux → MainAi)
ChatSupport redirige vers des routes inexistantes
Messaging
ChatScreen = conversation mockée (fausse réponse auto après 1,5s)
« Chat intégré » dans le détail n'appelle pas POST /api/messages/
Cloche notifications = décorative (unread_count non utilisé)
AI Section
Toutes les features IA passent par des webhooks n8n localhost — déconnectées du backend Homify
« Calculateur de loyer » affiche en réalité un calculateur hypothécaire US
Copy en anglais / villes US alors que le produit cible le Cameroun
Intégration API (transversal)
Deux configs API dupliquées (propertyService.ts vs routes.ts)
Type Hotel (legacy) vs domaine Property backend
Promesses landing (favoris sync, messagerie, publier une annonce) largement non implémentées
Ordre de priorité suggéré (full-stack)
Client API centralisé avec JWT + refresh
Favoris end-to-end (token + cœurs branchés)
Détail propriété via API (landlord, galerie, vraie description)
Messagerie réelle (remplacer le mock chat)
Modération propriétés (bloquer auto-publish côté backend)
Rate limit messages côté backend
Parcours propriétaire (my_properties, création d'annonce)
Routes URL pour détail, favoris, messages

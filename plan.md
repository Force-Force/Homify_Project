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


Frontend — Perspectives d'amélioration ✅ (phase 1 + phase 2)
- Client API centralisé (`apiClient.ts`) avec JWT + refresh automatique
- `authService` + `AuthContext` : login, logout, GET/PATCH `/auth/me/`, verify/resend email
- Favoris branchés (`FavoritesContext`, cœurs sur cartes, DELETE by-property)
- Détail via `GET /properties/{id}/` (galerie, description, landlord, équipements)
- Messagerie réelle (`messageService`, thread + POST messages, cloche unread_count)
- Routes URL : `/home`, `/favorites`, `/profile`, `/assist`, `/property/:id`, `/property/:id/chat`
- Profil dynamique, reset password, signin via authService
- Pagination + filtres avancés (meublé, chambres, salles de bain, quartier, surface, geo)
- Parcours propriétaire : `/my-properties`, `/property/new` (création + photos + soumission)
- Section IA : calculateur loyer FCFA, copy Cameroun, chat support localisé
- UX vérification email : `/verify-pending`, `/verify-email`, signup/signin branchés

Frontend — Phase 3 ✅
- Boîte de réception messages (`/messages`) + cloche Home
- Signalement annonce depuis le détail (POST `/reports/`)
- Annonces similaires sur la fiche bien
- Édition annonce (`/property/:id/edit`) + suppression soft-delete
- Changement mot de passe profil (`POST /auth/me/password/`)
- Dashboard admin modération (`/admin`) — approve/reject pending
- Recherche intelligente branchée sur l'API réelle (SmartProperty)

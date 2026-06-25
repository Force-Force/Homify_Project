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
- API conversations : `GET /api/messages/conversations/` (fil par bien, dernier message, contact, unread)
- Marquer fil lu : `POST /api/messages/thread/{property_id}/mark_read/`
- Tests : `apps.chat.tests` (conversations + mark_thread_read)

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

Frontend — Messagerie intégrée ✅
- Onglet **Messages** dans la navigation (badge unread sur mobile + sidebar)
- Boîte de réception par conversation (`/messages`) : recherche, photo bien, badge non-lus
- Écran chat (`/property/:id/chat`) : scroll auto, polling 12s, regroupement par date, suggestions
- Lien vers fiche bien depuis le chat ; marquage lu à l'ouverture du fil
- Routes : `/messages`, `/property/:id/chat` ; onglet Messages actif sur les deux

Frontend — Phase 3 ✅
- Signalement annonce depuis le détail (POST `/reports/`)
- Annonces similaires sur la fiche bien
- Édition annonce (`/property/:id/edit`) + suppression soft-delete
- Changement mot de passe profil (`POST /auth/me/password/`)
- Dashboard admin modération (`/admin`) — approve/reject pending
- Recherche intelligente branchée sur l'API réelle (SmartProperty)

Frontend — Phase 4 ✅
- Analyse de marché API (`marketService`) — stats loyer/surface/type par ville (sans n8n)
- Admin dashboard complet (`/admin`) : onglets Annonces, Signalements, Utilisateurs
- Modération signalements : review → resolve/dismiss + actions (reject/unpublish/suspend)
- Gestion utilisateurs admin : suspendre / réactiver
- Messagerie : onglets Reçus / Envoyés + suppression message (expéditeur) + marquer lu
- Suppression compte (`POST /auth/me/delete/`) depuis le profil
- Suppression photos en édition annonce (`DELETE /properties/{id}/photos/{photoId}/`)

Frontend — Phase 5 ✅
- Config env : `VITE_API_BASE_URL`, `VITE_N8N_WEBHOOK_URL` (`.env.example`, `routes.ts`)
- Garde-fous routes : `RoleGuard` (LANDLORD/ADMIN), page 404 (`NotFoundScreen`)
- Admin publication complète : approve + publish, section « Approuvées — à publier »
- Landing dynamique : stats + 4 annonces récentes via API publique
- Formulaire annonce : géolocalisation GPS (lat/lng) + suppression photos en édition
- ChatSupport : mode FAQ local si n8n absent ou indisponible (fallback automatique)
- Build prod validé (`npm run build`)

Frontend — Phase 6 ✅
- CI GitHub Actions : tests backend + lint/typecheck/build frontend
- Tests smoke backend : health, auth, liste annonces publiées
- Endpoint `GET /api/health/` (liveness/readiness)
- Settings prod : `DATABASE_URL` PostgreSQL, CORS env, hardening `DEBUG=False`
- Stack prod : `docker-compose.prod.yml` (Gunicorn + Celery + Nginx SPA)
- `Backend_homify/.env.example`, `Frontend_homify/Dockerfile`, `scripts/smoke-test.sh`
- Makefile : `make test`, `make ci`, `make smoke`, `make prod-up/down`
- README racine avec guide déploiement

Backend — Notifications ✅
- App `apps/notifications` : modèles `Notification` + `NotificationPreference`
- API : liste, unread_count, mark_read, mark_all_read, preferences GET/PATCH
- Dispatch unifié : notification in-app + email (selon préférences utilisateur)
- Branché sur messages, approve/reject/publish annonces
- Tests API notifications (3) + smoke existants
- Frontend : `/notifications` (inbox), préférences sync backend, cloche Home

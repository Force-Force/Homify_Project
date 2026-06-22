Backend — Perspectives d'amélioration (logique métier)
Architecture transversale ✅ (corrigé)
- Couche services : `apps/core/services/` (lifecycle, media, messaging, notifications, reports, users)
- Tâches Celery : `apps/core/tasks.py` (emails, thumbnails, notifications)
- États branchés : APPROVED (approve→publish), REVIEWED (review), DELETED (soft delete)
- Règles doc implémentées : rate limit messages, min 3 photos/upload, bcrypt, validation photos 5Mo JPG/PNG


Auth & Users
Priorité	Problème
Critique
Utilisateurs suspendus gardent un JWT valide 24h — pas de blacklist/revocation
Haute
Vérification email annoncée à l’inscription, jamais implémentée
Haute
status et is_active peuvent diverger via PATCH admin
Moyenne
Pas de reset password, logout, suppression de compte
Moyenne
last_login_at jamais mis à jour ; rôle VISITOR inutilisé
Basse
Admin peut se suspendre lui-même, supprimer des users sans audit trail
Properties (annonces)
Priorité	Problème
Critique
Un propriétaire peut auto-publier via PATCH status: "PUBLISHED" — bypass de la modération
Haute
Raison de rejet non stockée, pas de notification au landlord
Haute
Règles photos (min 3, 5 Mo, JPG/PNG) non appliquées — seul max 10 fichiers
Moyenne
view_count gonflé à chaque refresh (pas de déduplication)
Moyenne
Téléphone landlord non masqué dans le détail public
Moyenne
Pas de soft-delete, pas de transition vers RENTED
Basse
Filtre number_of_bathrooms documenté mais absent du PropertyFilter
Basse
Pas de recherche géographique malgré lat/lng sur Address
Favorites
Favoris obsolètes quand une annonce passe en REJECTED/RENTED/DRAFT
Pas de nettoyage automatique au changement de statut
Deux chemins DELETE incohérents (PK favori vs property_id)


Chat / Messages
Priorité	Problème
Critique
Rate limit 3 messages/24h/propriété documenté, jamais appliqué
Haute
Modèle unidirectionnel — le landlord ne peut pas répondre dans le thread
Haute
Messages modifiables/supprimables par n’importe quelle partie
Moyenne
Pas de notifications (email/push) à la réception d’un message
Reports (signalements)
Statut REVIEWED jamais utilisé
Pas de prévention des doublons (même user + même annonce)
resolve/dismiss sans effet sur l’annonce ou l’utilisateur signalé
Canaux de modération (reports vs reject property) non unifiés
Amenities
Suppression d’un amenity retire silencieusement l’équipement de toutes les annonces
Pas de filtre par catégorie malgré CATEGORY_CHOICES sur le modèle
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
Profil hardcodé (Melissa Peters) — pas d’appel GET /auth/me/
ProfileScreen.tsx
Moyenne
rememberMe cosmétique, auth non réactive après login
HomifiSignIn.tsx
Moyenne
Rôle LANDLORD collecté à l’inscription, aucune UX propriétaire
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
API favorites retourne 401 sans token → liste vide sans message d’erreur clair
Pas de désynchronisation entre Home et Favoris
Navigation
Pas de deep linking (/property/42) — refresh perd le contexte
Onglets Search et Assist identiques (tous deux → MainAi)
ChatSupport redirige vers des routes inexistantes
Messaging
ChatScreen = conversation mockée (fausse réponse auto après 1,5s)
« Chat intégré » dans le détail n’appelle pas POST /api/messages/
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
Parcours propriétaire (my_properties, création d’annonce)
Routes URL pour détail, favoris, messages
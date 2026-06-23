# Homify

Plateforme de location immobilière (Cameroun) — monorepo Django REST + React/Vite.

## Démarrage rapide (dev local, sans Docker)

```bash
make install-local   # une seule fois
make dev-local       # backend :8000 + frontend :5173
```

- Frontend : http://localhost:5173  
- API : http://localhost:8000/api/  
- Swagger : http://localhost:8000/api/docs/

Copiez `Frontend_homify/.env.example` vers `Frontend_homify/.env.local` si vous devez surcharger l’URL API.

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `make dev-local` | Dev backend SQLite + frontend Vite |
| `make dev` | Dev avec Docker (PostgreSQL + Redis) |
| `make test` | Tests backend + lint/typecheck/build frontend |
| `make smoke` | Smoke test API (backend démarré) |
| `make prod-up` | Stack production Docker |
| `make help` | Toutes les commandes |

## Structure

```
Backend_homify/   Django REST API, Celery, modération
Frontend_homify/  React + TypeScript + Tailwind + Vite
documentation/    Modèles, routes, intégrations
plan.md           Roadmap des phases frontend/backend
```

## Déploiement production

1. Copiez et éditez les variables :
   ```bash
   cp Backend_homify/.env.example Backend_homify/.env
   # SECRET_KEY, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, FRONTEND_URL
   ```

2. Lancez la stack :
   ```bash
   export SECRET_KEY="votre-clé-secrète-longue"
   export ALLOWED_HOSTS="votre-domaine.com"
   export CORS_ALLOWED_ORIGINS="https://votre-domaine.com"
   make prod-up
   ```

La stack `docker-compose.prod.yml` inclut :
- **PostgreSQL** + **Redis**
- **Gunicorn** (API Django)
- **Celery worker** (emails, thumbnails)
- **Nginx** (SPA React + reverse proxy `/api/` et `/media/`)

Health check : `GET /api/health/`

Smoke test après déploiement :
```bash
API_BASE=https://votre-domaine.com/api ./scripts/smoke-test.sh
```

## CI

Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute :
- Backend : migrations + tests smoke (`apps.core.tests`)
- Frontend : ESLint + TypeScript + build Vite

## Documentation

- [Backend API](Backend_homify/README.md)
- [Documentation projet](documentation/README.md)
- [Plan d’implémentation](plan.md)

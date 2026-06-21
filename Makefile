# Homify — Makefile
# Usage: make help

FRONTEND_DIR := Frontend_homify
BACKEND_DIR  := Backend_homify
FRONTEND_PORT := 5173
BACKEND_PORT  := 8000

.PHONY: help install install-frontend install-backend \
        dev dev-frontend dev-backend \
        backend backend-detached backend-logs backend-stop backend-down \
        frontend frontend-build \
        migrate superuser shell logs stop clean

# ─── Aide ────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  Homify — commandes disponibles"
	@echo "  ─────────────────────────────"
	@echo "  make install          Installe les dépendances (frontend + build Docker backend)"
	@echo "  make dev              Lance backend (Docker) + frontend (Vite) ensemble"
	@echo "  make frontend         Lance uniquement le frontend  → http://localhost:$(FRONTEND_PORT)"
	@echo "  make backend          Lance le backend via Docker   → http://localhost:$(BACKEND_PORT)"
	@echo "  make backend-detached Démarre le backend en arrière-plan"
	@echo "  make stop             Arrête les conteneurs Docker"
	@echo "  make migrate          Applique les migrations Django"
	@echo "  make superuser        Crée un compte admin Django"
	@echo "  make backend-logs     Affiche les logs du backend"
	@echo "  make frontend-build   Build de production du frontend"
	@echo "  make clean            Arrête Docker et supprime node_modules frontend"
	@echo ""

# ─── Installation ────────────────────────────────────────────────────────────

install: install-frontend install-backend

install-frontend:
	cd $(FRONTEND_DIR) && npm install

install-backend:
	cd $(BACKEND_DIR) && docker compose build

# ─── Développement ───────────────────────────────────────────────────────────

dev: backend-detached
	@sleep 4
	@echo "→ Backend : http://localhost:$(BACKEND_PORT)/api/"
	@echo "→ Swagger : http://localhost:$(BACKEND_PORT)/api/docs/"
	@echo "→ Frontend: http://localhost:$(FRONTEND_PORT)"
	@$(MAKE) dev-frontend

dev-frontend:
	cd $(FRONTEND_DIR) && npm run dev -- --host

dev-backend:
	cd $(BACKEND_DIR) && docker compose up

frontend:
	cd $(FRONTEND_DIR) && npm run dev -- --host

frontend-build:
	cd $(FRONTEND_DIR) && npm run build

# ─── Backend (Docker) ────────────────────────────────────────────────────────

backend:
	cd $(BACKEND_DIR) && docker compose up

backend-detached:
	cd $(BACKEND_DIR) && docker compose up -d
	@echo "Backend démarré en arrière-plan."

backend-logs:
	cd $(BACKEND_DIR) && docker compose logs -f web

backend-stop stop:
	cd $(BACKEND_DIR) && docker compose stop

backend-down:
	cd $(BACKEND_DIR) && docker compose down

migrate:
	cd $(BACKEND_DIR) && docker compose exec web python manage.py migrate

superuser:
	cd $(BACKEND_DIR) && docker compose exec web python manage.py createsuperuser

shell:
	cd $(BACKEND_DIR) && docker compose exec web python manage.py shell

logs: backend-logs

# ─── Nettoyage ───────────────────────────────────────────────────────────────

clean: backend-down
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist

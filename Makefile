# Homify — Makefile
# Usage: make help

FRONTEND_DIR := Frontend_homify
BACKEND_DIR  := Backend_homify
FRONTEND_PORT := 5173
BACKEND_PORT  := 8000

PYTHON       := python3
VENV         := $(BACKEND_DIR)/.venv
VENV_PYTHON  := $(VENV)/bin/python
VENV_PIP     := $(VENV)/bin/pip

.PHONY: help install install-local install-frontend install-backend install-backend-local \
        dev dev-local dev-frontend dev-backend dev-backend-local \
        backend backend-detached backend-local backend-logs backend-stop backend-down \
        frontend frontend-build \
        migrate migrate-local superuser superuser-local shell logs stop stop-local clean

# ─── Aide ────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  Homify — commandes disponibles"
	@echo "  ─────────────────────────────"
	@echo ""
	@echo "  Docker (backend PostgreSQL + Redis)"
	@echo "  make install          Installe frontend + build Docker backend"
	@echo "  make dev              Lance backend Docker + frontend"
	@echo "  make backend          Backend via Docker  → http://localhost:$(BACKEND_PORT)"
	@echo "  make stop             Arrête les conteneurs Docker"
	@echo ""
	@echo "  Local (sans Docker — SQLite)"
	@echo "  make install-local    Installe frontend + venv Python + migrations"
	@echo "  make dev-local        Lance backend local + frontend ensemble"
	@echo "  make backend-local    Backend Django local  → http://localhost:$(BACKEND_PORT)"
	@echo "  make migrate-local    Migrations Django (local)"
	@echo "  make superuser-local  Compte admin Django (local)"
	@echo "  make stop-local       Arrête le backend local (si lancé en arrière-plan)"
	@echo ""
	@echo "  Frontend"
	@echo "  make frontend         Frontend Vite  → http://localhost:$(FRONTEND_PORT)"
	@echo "  make frontend-build   Build de production"
	@echo ""
	@echo "  Autres (Docker)"
	@echo "  make migrate          Migrations via Docker"
	@echo "  make superuser        Admin via Docker"
	@echo "  make backend-logs     Logs Docker"
	@echo "  make clean            Arrête Docker + supprime node_modules"
	@echo ""

# ─── Installation ────────────────────────────────────────────────────────────

install: install-frontend install-backend

install-local: install-frontend install-backend-local

install-frontend:
	cd $(FRONTEND_DIR) && npm install

install-backend:
	cd $(BACKEND_DIR) && docker compose build

install-backend-local:
	@test -d $(VENV) || $(PYTHON) -m venv $(VENV)
	$(VENV_PIP) install --upgrade pip
	$(VENV_PIP) install -r $(BACKEND_DIR)/requirements.txt
	cd $(BACKEND_DIR) && $(VENV_PYTHON) manage.py migrate --noinput
	@echo "Backend local prêt (venv: $(VENV), base: SQLite)"

# ─── Développement (Docker) ──────────────────────────────────────────────────

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

# ─── Développement (local, sans Docker) ─────────────────────────────────────

dev-local:
	@test -d $(VENV) || (echo "❌ Venv absent. Lancez: make install-local" && exit 1)
	@echo "→ Backend : http://localhost:$(BACKEND_PORT)/api/"
	@echo "→ Swagger : http://localhost:$(BACKEND_PORT)/api/docs/"
	@echo "→ Frontend: http://localhost:$(FRONTEND_PORT)"
	@$(MAKE) -j2 dev-backend-local dev-frontend

dev-backend-local: backend-local

backend-local:
	@test -d $(VENV) || (echo "❌ Venv absent. Lancez: make install-local" && exit 1)
	cd $(BACKEND_DIR) && $(VENV_PYTHON) manage.py migrate --noinput
	cd $(BACKEND_DIR) && $(VENV_PYTHON) manage.py runserver 0.0.0.0:$(BACKEND_PORT)

migrate-local:
	@test -d $(VENV) || (echo "❌ Venv absent. Lancez: make install-local" && exit 1)
	cd $(BACKEND_DIR) && $(VENV_PYTHON) manage.py migrate

superuser-local:
	@test -d $(VENV) || (echo "❌ Venv absent. Lancez: make install-local" && exit 1)
	cd $(BACKEND_DIR) && $(VENV_PYTHON) manage.py createsuperuser

stop-local:
	@if [ -f $(BACKEND_DIR)/.backend.pid ]; then \
		kill $$(cat $(BACKEND_DIR)/.backend.pid) 2>/dev/null && echo "Backend local arrêté."; \
		rm -f $(BACKEND_DIR)/.backend.pid; \
	else \
		pkill -f "$(BACKEND_DIR).*manage.py runserver" 2>/dev/null && echo "Backend local arrêté." || true; \
	fi

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

clean: backend-down stop-local
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist

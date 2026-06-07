# Technologies

The Homify project is built using a modern, decoupled tech stack separating the backend API from the frontend client.

## Backend Stack

- **Framework**: Django 4.2.7
- **API Framework**: Django REST Framework (DRF) 3.14.0
- **Database**: PostgreSQL 15 (via psycopg3)
- **Caching & Message Broker**: Redis 7
- **Task Queue**: Celery 5.3.4 (for asynchronous tasks)
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- **API Documentation**: drf-yasg (Swagger UI & ReDoc)
- **Image Processing**: Pillow
- **Environment Configuration**: python-decouple

## Frontend Stack

- **Core Library**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS & Autoprefixer
- **Animations**: Framer Motion
- **Maps**: Leaflet & React-Leaflet
- **HTTP Client**: Axios
- **Icons**: Lucide React & React Icons
- **Backend as a Service integration**: Supabase JS (potentially for specific features like real-time or storage)

## DevOps & Infrastructure

- **Containerization**: Docker & Docker Compose
- **Web Server (Dev)**: Vite dev server (Frontend), Django dev server (Backend)
- **Database Management**: SQLite (fallback/local), PostgreSQL (via Docker)

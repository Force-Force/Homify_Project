# Integrations & Setup

Homify relies on several external services and databases, managed via Docker for ease of development and deployment.

## Containerized Infrastructure

The backend services are orchestrated using Docker Compose (`docker-compose.yml`), ensuring consistent environments across development and production.

### PostgreSQL
- **Service Name**: `db`
- **Image**: `postgres:15-alpine`
- **Role**: Primary relational database. Stores users, properties, messages, and transactional data.
- **Volume**: `postgres_data` persists data across container restarts.

### Redis
- **Service Name**: `redis`
- **Image**: `redis:7-alpine`
- **Role**: Acts as the message broker for Celery and potentially as a caching layer for the Django application.

### Web (Django)
- **Service Name**: `web`
- **Role**: The main application server.
- **Dependencies**: Waits for `db` and `redis` to be healthy before starting.
- Runs migrations, collects static files, and starts the development server.

## External API Integrations

### Supabase
- The frontend includes `@supabase/supabase-js` as a dependency.
- This might be used for real-time functionalities (like websockets for chat), specialized authentication flows, or external storage (e.g., saving property images directly from the frontend if not using Django's media storage).

### Maps (Leaflet)
- The frontend utilizes `leaflet` and `react-leaflet`.
- This provides interactive maps for users to visualize property locations, explore neighborhoods, and interact with geospatial data.

## Running the Application Locally

### Backend Setup
1. Navigate to `Backend_homify`.
2. Run `docker-compose up --build`.
   - This spins up PostgreSQL, Redis, and the Django server.
   - The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to `Frontend_homify`.
2. Install dependencies: `npm install`.
3. Start the Vite dev server: `npm run dev`.
   - The application will be available typically at `http://localhost:5173`.

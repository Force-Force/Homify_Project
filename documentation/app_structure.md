# App Structure

The repository is divided into two main projects: `Backend_homify` and `Frontend_homify`.

## Root Structure

```text
Homify_Project/
├── Backend_homify/      # Django REST API backend
├── Frontend_homify/     # React application
└── documentation/       # Project documentation
```

## Backend Structure (`Backend_homify/`)

The backend follows a modular Django app structure.

```text
Backend_homify/
├── rental_project/      # Main Django project configuration
│   ├── settings.py      # Core settings, database, apps, JWT
│   ├── urls.py          # Root URL routing and Swagger docs
│   └── celery.py        # Celery task configuration
├── apps/                # Django applications
│   ├── users/           # User models, authentication, roles
│   ├── properties/      # Property listings, addresses, photos
│   ├── chat/            # User-to-user messaging
│   ├── favorites/       # Saved properties
│   ├── amenities/       # Property equipment and features
│   └── reports/         # Content moderation and reporting
├── Dockerfile           # Backend container definition
├── docker-compose.yml   # Multi-container setup (DB, Redis, Web)
├── requirements.txt     # Python dependencies
└── manage.py            # Django management script
```

## Frontend Structure (`Frontend_homify/`)

The frontend is a Vite-powered React application using feature-based and layer-based organization.

```text
Frontend_homify/
├── src/
│   ├── api/             # API configuration and Axios instances
│   ├── components/      # Reusable UI components
│   │   ├── Authentification/ # Auth modals and forms
│   │   ├── BottomNav.tsx     # Mobile navigation
│   │   ├── Cards.tsx         # Property display cards
│   │   ├── PropertyImage.tsx # Image galleries
│   │   └── PropertyMap.tsx   # Leaflet map integration
│   ├── data/            # Mock data and static content
│   ├── screens/         # Page-level components
│   │   ├── HomeScreen.tsx
│   │   ├── PropertyDetailsScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── Aisection/        # AI-related features/screens
│   ├── services/        # Business logic and API calls
│   │   ├── propertyService.ts
│   │   └── PropertyDetailsServices.ts
│   ├── types/           # TypeScript interfaces and types
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles and Tailwind imports
├── package.json         # Node dependencies and scripts
├── tailwind.config.js   # Tailwind design system configuration
├── vite.config.ts       # Vite bundler configuration
└── API_DOCUMENTATION.md # Frontend API interaction notes
```

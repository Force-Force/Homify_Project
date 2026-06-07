# Routes & Navigation

## Backend API Endpoints

The Django backend exposes RESTful APIs organized by app. The base URL for the API is typically `http://localhost:8000/`.

### Authentication & Users (`/api/auth/`)
- Handles user registration, login (JWT generation), profile management, and role switching.

### Properties (`/api/properties/`)
- `GET /api/properties/`: List and search/filter properties.
- `POST /api/properties/`: Create a new property listing (Landlords).
- `GET /api/properties/{id}/`: Retrieve property details.
- Handles endpoints for addresses and photo uploads.

### Favorites (`/api/favorites/`)
- `GET /api/favorites/`: Get the authenticated user's saved properties.
- `POST /api/favorites/`: Add a property to favorites.
- `DELETE /api/favorites/{id}/`: Remove a property from favorites.

### Messages (`/api/messages/`)
- `GET /api/messages/`: Retrieve user's inbox/outbox.
- `POST /api/messages/`: Send a message to another user.

### Amenities (`/api/amenities/`)
- `GET /api/amenities/`: List available amenities and equipment.

### Reports (`/api/reports/`)
- `POST /api/reports/`: Submit a signalement/report.

### API Documentation
- `GET /api/docs/`: Swagger UI interactive documentation.
- `GET /api/redoc/`: ReDoc API documentation.

## Frontend Routes

Frontend routing is managed by `react-router-dom` and is configured in the React application.

Typical application flows include:
- **`/` (Home)**: The main landing page with search and featured properties (`HomeScreen`).
- **`/property/:id`**: Detailed view of a specific property, including images, map, and amenities (`PropertyDetailsScreen`).
- **`/favorites`**: A personalized view of properties the user has saved (`FavoritesScreen`).
- **`/chat` or `/messages`**: The messaging interface to communicate with landlords or tenants (`ChatScreen`).
- **`/profile`**: User account settings and role management (`ProfileScreen`).

The frontend also utilizes dynamic modals for authentication (Login/Signup) layered over the current route.

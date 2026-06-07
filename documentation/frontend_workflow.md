# Frontend Workflow

The React frontend relies on a structured workflow for rendering components, managing state, and communicating with the backend API.

## Component Architecture

The UI is built using functional React components and Hooks. The interface follows a layered pattern:

1. **Root (`App.tsx` & `main.tsx`)**: Sets up the React context, routing providers (BrowserRouter), and global state (if any).
2. **Screens (`src/screens/`)**: High-level components acting as pages. They are mapped to specific routes.
   - Example: `HomeScreen` handles the main layout, search bar, and lists `Cards` components.
3. **Components (`src/components/`)**: Reusable UI blocks.
   - Example: `Cards.tsx` renders an individual property snippet. `BottomNav.tsx` handles mobile navigation. `PropertyMap.tsx` encapsulates Leaflet map logic.

## State Management

State is managed primarily using React Hooks (`useState`, `useEffect`, `useContext`).
- **Local State**: Managed within individual components (e.g., form inputs, modal visibility).
- **Global State**: For elements like user authentication status or selected theme, React Context or specialized state libraries may be used.

## API Communication

Communication with the Django backend is encapsulated in the `src/services/` and `src/api/` directories.

1. **Axios Configuration (`src/api/`)**: Base instances of Axios are configured here, often attaching JWT tokens to outgoing requests via interceptors.
2. **Services (`src/services/`)**: Abstraction layer for API calls. Components rarely call Axios directly; instead, they call service methods.
   - Example: `propertyService.ts` contains methods like `getProperties()`, `getPropertyById()`, etc.
   - This separates business logic from UI logic and makes mocking/testing easier.

## Styling and Animation

- **Tailwind CSS**: Utility-first CSS framework used for rapid, responsive UI development. Configurations are in `tailwind.config.js`.
- **Framer Motion**: Used for complex animations, page transitions, and micro-interactions, enhancing the overall user experience and making the app feel "premium".

## AI Section

The `src/screens/Aisection/` suggests the implementation of AI features (e.g., chatbot assistants, smart recommendations, or image analysis). These components likely interact with specific backend endpoints or external AI services.

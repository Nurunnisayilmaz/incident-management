# Incident Management UI

React frontend for the Incident Management System. It provides authentication screens, incident list and detail workflows, incident create/update forms, audit log viewing, theme selection, and real-time backend communication.

## Project Setup

### Prerequisites

- Backend API running at `http://localhost:3000`

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The UI runs at:

```text
http://localhost:5173
```

The backend CORS configuration currently allows this origin.

## Technologies Used

- React 19
- Vite
- React Router
- Axios
- Socket.IO Client
- Zustand
- Tailwind CSS
- DaisyUI
- Lucide React
- React Hot Toast
- ESLint
- PostCSS
- Autoprefixer

## Architecture

The frontend is a Vite React single-page application. It keeps routing, page composition, reusable components, API access, sockets, state, and styling separated by responsibility.

```text
frontend/
  public/                 Static icons and favicon
  src/
    api/                  Axios client
    components/           Reusable UI components
    constants/            Shared constants
    pages/                Route-level pages
    store/                Zustand state stores
    utils/                Socket.IO client helpers
    App.jsx               Main route tree and user bootstrap
    main.jsx              React entry point
    index.css             Tailwind and global styles
  vite.config.js          Vite configuration
  tailwind.config.js      Tailwind and DaisyUI configuration
```

### Routing

Routes are defined in `src/App.jsx`:

- `/`: home page and incident management experience
- `/login`: login screen
- `/register`: registration screen
- `*`: not found screen

On application load, `App.jsx` checks for an `accessToken` in local storage and calls `/api/auth/me` to hydrate the current user.

### API Communication

The Axios client is defined in `src/api/axios.js`.

Current API base URL:

```text
http://localhost:3000
```

The client sends credentials with requests and removes the stored access token when a `401 Unauthorized` response is received.

### Real-Time Communication

Socket.IO client setup lives in `src/utils/socket.js`.

The socket connects to:

```text
http://localhost:3000
```

It authenticates using the access token from local storage and uses the WebSocket transport.

### State and Styling

- Theme state is managed with Zustand in `src/store/useThemeStore.js`.
- Tailwind CSS provides utility styling.
- DaisyUI provides theme-aware component styles.
- React Hot Toast is available for user notifications.

### Component Structure

Important UI components include:

- `Navbar.jsx`: top navigation and user actions
- `IncidentList.jsx`: incident listing
- `CreateIncidentForm.jsx`: create incident workflow
- `UpdateIncidentForm.jsx`: update incident workflow
- `IncidentDetailForm.jsx`: incident detail display
- `IncidentAuditLog.jsx`: audit history display
- `ConfirmModal.jsx`: confirmation dialog
- `ThemeSelector.jsx`: UI theme selector

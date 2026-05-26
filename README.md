# RedPandaFlow Frontend

React 19 SPA for RedPandaFlow, a collaborative kanban application.

## Stack

- React 19 with Vite 8
- Tailwind CSS 4 and shadcn/ui (base-lyra style)
- React Router
- Axios with cookie-based auth (HttpOnly)
- @microsoft/signalr for real-time updates
- @dnd-kit for drag and drop
- Zod and react-hook-form for form validation
- Phosphor Icons and Sonner for toasts

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- The backend ([redpandaflow-backend](https://github.com/RedPandaFlow/redpandaflow-backend)) reachable at `http://localhost:5090`

## Installation

```bash
git clone https://github.com/RedPandaFlow/redpandaflow-frontend.git
cd redpandaflow-frontend
npm install
```

Create a `.env` file at the workspace root:

```bash
VITE_API_URL=http://localhost:5090/api
```

## Run in development

The recommended way is via the docker-compose stack in
[redpandaflow-infra](https://github.com/RedPandaFlow/redpandaflow-infra),
which brings up the backend and database alongside.

For a standalone run, with the backend already running:

```bash
npm run dev
```

The dev server is served at `http://localhost:5173`.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview the built bundle

## Related repos

- [redpandaflow-backend](https://github.com/RedPandaFlow/redpandaflow-backend) — ASP.NET Core API
- [redpandaflow-infra](https://github.com/RedPandaFlow/redpandaflow-infra) — docker-compose stack
- [documentation](https://github.com/RedPandaFlow/documentation) — project documentation

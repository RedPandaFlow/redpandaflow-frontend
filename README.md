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

## Run locally

The recommended way to run the frontend is via the docker-compose stack in
[redpandaflow-infra](https://github.com/RedPandaFlow/redpandaflow-infra),
which brings up the backend and database alongside.

For a standalone run, the backend must be reachable at `http://localhost:5090`:

```bash
npm install
npm run dev
```

Environment variables (via a `.env` file at the workspace root):

```bash
VITE_API_URL=http://localhost:5090/api
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview the built bundle

## Related repos

- [redpandaflow-backend](https://github.com/RedPandaFlow/redpandaflow-backend) — ASP.NET Core API
- [redpandaflow-infra](https://github.com/RedPandaFlow/redpandaflow-infra) — docker-compose stack
- [documentation](https://github.com/RedPandaFlow/documentation) — project documentation

# RedPandaFlow Frontend

SPA React 19 de RedPandaFlow, une application de kanban collaboratif.

## Présentation

Le frontend est une application monopage (SPA) pour RedPandaFlow : elle permet
de se connecter et de gérer espaces de travail, tableaux, colonnes et cartes,
avec une synchronisation en temps réel (présence, mutations de tableau,
notifications) via SignalR. Elle communique avec l'API backend en REST et en
WebSocket.

L'architecture globale (services et communication) est documentée dans le
[dépôt documentation](https://github.com/RedPandaFlow/documentation/blob/main/architecture.md).

## Équipe

Travail collaboratif sur l'ensemble du projet (backend, frontend, infra,
CI/CD, documentation) :

- Nathan FERRE
- Ylan Dessenne

## Stack

- React 19 avec Vite 8
- Tailwind CSS 4 et shadcn/ui (style base-lyra)
- React Router
- Axios avec authentification par cookie (HttpOnly)
- @microsoft/signalr pour les mises à jour temps réel
- @dnd-kit pour le glisser-déposer
- Zod et react-hook-form pour la validation des formulaires
- Phosphor Icons et Sonner pour les notifications visuelles

## Prérequis

- Node.js 20 ou plus récent
- npm 10 ou plus récent
- Le backend ([redpandaflow-backend](https://github.com/RedPandaFlow/redpandaflow-backend)) accessible sur `http://localhost:5090`

## Installation

```bash
git clone https://github.com/RedPandaFlow/redpandaflow-frontend.git
cd redpandaflow-frontend
npm install
```

Créer un fichier `.env` à la racine du workspace :

```bash
VITE_API_URL=http://localhost:5090/api
```

## Lancement en développement

La méthode recommandée est la stack docker-compose du dépôt
[redpandaflow-infra](https://github.com/RedPandaFlow/redpandaflow-infra),
qui démarre le backend et la base de données en parallèle.

Pour un lancement autonome, avec le backend déjà démarré :

```bash
npm run dev
```

Le serveur de développement est servi sur `http://localhost:5173`.

## Scripts

- `npm run dev` — serveur de développement Vite
- `npm run build` — build de production vers `dist/`
- `npm run lint` — ESLint
- `npm run preview` — prévisualisation du build

## Dépôts liés

- [redpandaflow-backend](https://github.com/RedPandaFlow/redpandaflow-backend) — API ASP.NET Core
- [redpandaflow-infra](https://github.com/RedPandaFlow/redpandaflow-infra) — stack docker-compose
- [documentation](https://github.com/RedPandaFlow/documentation) — documentation du projet

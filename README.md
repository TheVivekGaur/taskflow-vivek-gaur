# TaskFlow

A production-grade task management application (Kanban-style) built with React, TypeScript, and Vite. The frontend is fully self-contained using MSW (Mock Service Worker) as the API layer — no backend server required.

## 1. Overview

Users can register, log in, create projects, and manage tasks through a drag-and-drop Kanban board with real-time filtering by status, priority, and search.

**Live features:**
- JWT-based auth with persistent sessions (localStorage)
- Project CRUD with optimistic delete + rollback
- Task CRUD via modal (title, description, status, priority, assignee, due date)
- Drag-and-drop Kanban board (todo → in_progress → done)
- Filter tasks by status, priority, and free-text search
- Dark mode toggle persisted across sessions
- Loading, error, and empty states on every view
- Responsive at 375px (mobile) and 1280px (desktop)
- Protected routes with redirect to `/login`

## 2. Architecture Decisions

### Why React + TypeScript + Vite
Vite gives sub-second HMR and optimized production builds. TypeScript catches bugs at compile time. React 19 with Suspense and lazy routes keeps the bundle lean.

### State Management Strategy
| Concern | Solution | Why |
|---------|----------|-----|
| Auth (user/token) | React Context | Global, infrequently updated — Context is lightweight and avoids external deps |
| Task data | Zustand | Needs optimistic updates, rollbacks, complex mutations — Zustand is minimal (no boilerplate vs Redux) with direct state access |
| Server state | Axios + manual fetch | Simple REST calls; would migrate to TanStack Query for caching/revalidation at scale |
| Routing | React Router v7 | Industry standard, supports lazy routes, protected route guards |

### Component Library: Material UI (MUI v9)
Chosen for its comprehensive component set, built-in accessibility, responsive utilities, and theming system. The `sx` prop keeps styles co-located with components — no CSS module sprawl.

### Drag-and-Drop: @dnd-kit
Modern, accessible, touch-friendly. Handles keyboard navigation out of the box unlike older libraries (react-beautiful-dnd is deprecated).

### Component Design
- **No prop drilling** — Auth via Context hook (`useAuth`), tasks via Zustand hook (`useTaskStore`)
- **Sensible breakdown** — Pages own data fetching, components are presentational, store handles mutations
- **Optimistic UI** — Task updates/deletes mutate the store instantly, fire the API, and rollback on failure with a Snackbar error

### API & Mocking (MSW)
Axios client with request interceptor (attaches JWT) and response interceptor (catches 401 → force logout). MSW intercepts all requests with realistic latency, validation, and HTTP status codes.

## 3. Setup & Running

### Prerequisites
- Node.js ≥ 18
- Docker Desktop (for containerized run)

### Repo Structure
```
taskflow-[your-name]/
├── docker-compose.yml        # Root compose — runs everything
├── .env.example              # Root env template
├── .gitignore
├── README.md                 # This file
└── frontend/                 # React + Vite frontend
    ├── Dockerfile            # Multi-stage: node build → nginx serve
    ├── .env.example
    ├── nginx.conf
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── api/              # Axios client + API modules (auth, projects, tasks)
        ├── components/
        │   ├── auth/         # LoginForm, RegisterForm
        │   ├── common/       # Loader, ErrorState, EmptyState
        │   ├── layout/       # Navbar
        │   ├── projects/     # ProjectCard, CreateProjectDialog
        │   └── tasks/        # KanbanBoard, TaskColumn, TaskCard, TaskModal, TaskFilters
        ├── context/          # AuthContext (React Context for auth state)
        ├── mocks/            # MSW handlers, seed data, browser worker
        ├── pages/            # LoginPage, RegisterPage, ProjectsPage, ProjectDetailPage
        ├── routes/           # AppRoutes, ProtectedRoute
        ├── store/            # useTaskStore (Zustand)
        ├── theme/            # MUI theme configuration (light/dark)
        └── types/            # Shared TypeScript interfaces
```

### Option A: Docker (Evaluation)
```bash
docker compose up --build
```
App runs at `http://localhost:3000`

The Docker setup uses a multi-stage build (Node for build → nginx for serving) with gzip compression and SPA fallback routing.

### Option B: Local Development
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

### Environment Variables
Copy `.env.example` to `.env` inside `frontend/`:
```
VITE_API_BASE_URL=http://localhost:4000
```
> Note: Since MSW handles all API calls client-side, this URL is only used as a prefix for MSW route matching.

## 4. Test Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | `test@example.com` |
| Password | `password123`      |

You can also register a new account freely.

## 5. Testing

```bash
cd frontend
npm run test:unit    # Single run (Vitest)
npm run test         # Watch mode (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

Unit tests cover: API layer, auth context, task store, all components (forms, cards, modals, filters, kanban board, navbar), route guards, and pages.

## 6. API Reference

All endpoints are handled by MSW (Mock Service Worker). Base URL: `http://localhost:4000`

| Endpoint | Method | Auth | Status Codes | Description |
|----------|--------|------|-------------|-------------|
| `/auth/register` | POST | No | 201, 400 | Register new user, returns JWT |
| `/auth/login` | POST | No | 200, 400, 401 | Login, returns JWT |
| `/projects` | GET | Yes | 200, 401 | List user's projects |
| `/projects` | POST | Yes | 201, 400, 401 | Create project |
| `/projects/:id` | GET | Yes | 200, 401, 403, 404 | Get project with tasks |
| `/projects/:id` | PATCH | Yes | 200, 401, 403, 404 | Update project |
| `/projects/:id` | DELETE | Yes | 204, 401, 403, 404 | Delete project + its tasks |
| `/projects/:id/tasks` | GET | Yes | 200, 401, 404 | List tasks (`?status=` and `?assignee=` filters) |
| `/projects/:id/tasks` | POST | Yes | 201, 400, 401, 404 | Create task |
| `/tasks/:id` | PATCH | Yes | 200, 401, 404 | Update task |
| `/tasks/:id` | DELETE | Yes | 204, 401, 404 | Delete task |

**Example — Create Task:**
```json
POST /projects/prj_001/tasks
Authorization: Bearer <token>

{
  "title": "Design homepage",
  "description": "Create wireframes",
  "priority": "high",
  "assignee_id": "usr_001",
  "due_date": "2026-04-15"
}

→ 201 { "id": "tsk_abc123", "title": "Design homepage", "status": "todo", ... }
```

## 7. What You'd Do With More Time

Honest reflection on shortcuts and next steps:

- **TanStack Query**: Replace manual fetch/loading/error state with React Query for automatic caching, background revalidation, and deduplication. Currently every page manages its own loading state — this is repetitive.
- **Real backend**: The MSW mock layer is great for prototyping but doesn't persist data across refreshes. A real Express/Fastify API with PostgreSQL would be the next step.
- **WebSocket/SSE for real-time**: Multiple users editing the same board would need live updates. Socket.io or Server-Sent Events would sync task movements.
- **Pagination & virtualization**: The Kanban board renders all tasks in DOM. With 500+ tasks, we'd need virtual scrolling (react-window) and paginated API responses.
- **E2E test coverage**: Only the auth flow has a Playwright test. Would add full project CRUD and task drag-and-drop E2E scenarios.
- **Accessibility audit**: MUI provides good baseline a11y, but a manual screen reader audit and keyboard navigation test would catch edge cases.
- **CI/CD pipeline**: GitHub Actions for lint → type-check → unit tests → build → deploy on every PR.

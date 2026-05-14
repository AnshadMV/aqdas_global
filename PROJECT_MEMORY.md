# AQDAS PROJECT MEMORY

> **IMPORTANT**: Always read this file before making any changes. Follow all conventions listed below.

---

## Project Overview

**Project Name:** Aqdas
**Type:** Scalable Angular + Firebase e-commerce PWA web application
**Architecture:** Modern frontend with NgRx state management, Tailwind CSS, and Firebase backend services
**Firebase Plan:** Spark (Free) — structured for future scalability

---

## Version Registry

| Package                    | Version   |
| -------------------------- | --------- |
| **Angular**                | 21.2.13   |
| **Angular CLI**            | 21.2.11   |
| **@angular/build**         | 21.2.11   |
| **TypeScript**             | 5.9.3     |
| **Node.js**                | 22.17.1   |
| **npm**                    | 11.5.2    |
| **RxJS**                   | 7.8.2     |
| **@ngrx/store**            | 21.1.0    |
| **@ngrx/effects**          | 21.1.0    |
| **@ngrx/entity**           | 21.1.0    |
| **@ngrx/store-devtools**   | 21.1.0    |
| **@ngrx/signals**          | 21.1.0    |
| **Firebase SDK**           | 12.13.0   |
| **Tailwind CSS**           | 4.3.0     |
| **@tailwindcss/postcss**   | 4.3.0     |
| **PostCSS**                | 8.5.3     |
| **Prettier**               | 3.8.1     |
| **Vitest**                 | 4.0.8     |
| **tslib**                  | ^2.3.0    |

---

## Core Stack

### Frontend
- Angular 21 (standalone components — do NOT set `standalone: true`, it's the default)
- NgRx 21 (Store, Effects, Entity, Signals, Store DevTools)
- Angular Routing (lazy-loaded feature routes)
- Angular PWA (Service Worker)
- TypeScript 5.9 (strict mode)
- SCSS / Tailwind CSS 4
- Reactive Forms (not template-driven)

### Backend / Cloud
- Firebase SDK 12
- Firestore (primary database)
- Firebase Authentication (email/password)
- Firebase Hosting
- Firebase Storage
- Realtime Database (optional)
- Firebase Cloud Messaging (future)

---

## Project Architecture

```
src/app/
├── app.config.ts          # Root providers (router, store, SW)
├── app.routes.ts           # Top-level route definitions
├── app.ts                  # Root component
├── app.html                # Root template
├── app.css                 # Root styles
│
├── core/                   # Singleton services & config (never re-imported)
│   ├── firebase/
│   │   └── firebase.config.ts   # Firebase app, auth, firestore, storage instances
│   └── services/
│       ├── auth.service.ts       # Firebase Auth → Observable wrappers
│       ├── product.service.ts    # Firestore CRUD → Observable wrappers
│       └── index.ts
│
├── shared/                 # Reusable models, pipes, components, directives
│   └── models/
│       ├── product.model.ts
│       ├── user.model.ts
│       └── index.ts
│
└── store/                  # NgRx root store
    ├── index.ts             # Barrel: re-exports provideAppStore()
    ├── store.config.ts      # provideAppStore() — single-function store setup
    ├── app.state.ts         # AppState interface + root reducerMap
    │
    ├── product/             # Product feature store
    │   ├── product.actions.ts    # createActionGroup (CRUD + UI)
    │   ├── product.reducer.ts    # @ngrx/entity adapter
    │   ├── product.selectors.ts  # Feature + entity + derived selectors
    │   ├── product.effects.ts    # Firestore side-effects
    │   └── index.ts
    │
    ├── auth/                # Auth feature store
    │   ├── auth.actions.ts       # Login, Register, Logout, CheckAuth
    │   ├── auth.reducer.ts       # User, loading, error, isAuthenticated
    │   ├── auth.selectors.ts     # User, auth status, error selectors
    │   ├── auth.effects.ts       # Firebase Auth side-effects
    │   └── index.ts
    │
    └── ui/                  # UI/Layout feature store
        ├── ui.actions.ts         # Sidebar, theme, loading, toast
        ├── ui.reducer.ts         # Layout state
        ├── ui.selectors.ts       # Layout selectors
        └── index.ts
```

---

## Coding Conventions

### Angular Rules (MUST follow)
- **Standalone components only** — do NOT set `standalone: true` (default in Angular 21+)
- **`ChangeDetection.OnPush`** on every component
- **`input()` / `output()`** functions, never decorators
- **`inject()`** function, never constructor injection
- **Signals** for local state, **`computed()`** for derived state
- **Native control flow** (`@if`, `@for`, `@switch`) — never `*ngIf` / `*ngFor`
- **`class` / `style` bindings** — never `ngClass` / `ngStyle`
- **`host` object** in `@Component` — never `@HostBinding` / `@HostListener`
- **`NgOptimizedImage`** for all static images (not inline base64)
- **Reactive Forms** only (no template-driven)

### TypeScript Rules
- Strict type checking enabled
- Prefer type inference when type is obvious
- Never use `any` — use `unknown` when uncertain
- Use `export type` for type-only re-exports (required by `isolatedModules`)

### NgRx Patterns
- **`createActionGroup`** for all action definitions (grouped by source)
- **`createReducer` + `on`** for reducers — immutable state only
- **`@ngrx/entity`** (`EntityAdapter`) for all collection state
- **`createFeatureSelector` + `createSelector`** for all selectors (memoized)
- **Effects** use `inject()` for DI, `exhaustMap` for mutations, `switchMap` for reads
- **Services** return `Observable<T>` wrapping Firebase SDK promises via `from()`
- **Action naming**: `[Source] Event Name` → e.g., `[Product] Load Products Success`
- **No non-serializable data** in store (map Firebase objects to plain interfaces)

### State Management Rules
- Use `signal()` for **component-local** state
- Use **NgRx Store** for **shared/global** state (auth, products, UI)
- Use `computed()` for derived state
- Never use `mutate` on signals — use `update` or `set`

### File Organization
- **Feature stores**: `store/<feature>/` with actions, reducer, selectors, effects, index.ts
- **Core services**: `core/services/` — singleton, `providedIn: 'root'`
- **Shared models**: `shared/models/` — plain interfaces only
- **Barrel exports**: Every directory gets an `index.ts` barrel file

### Scalability Guidelines
- Lazy-load all feature routes
- Keep components small & focused (single responsibility)
- Reuse selectors — never duplicate selector logic
- Effects handle ALL side-effects (HTTP, Firebase, localStorage)
- Services are thin wrappers around external APIs (Firebase)
- Store is the single source of truth for global state

### Accessibility (WCAG AA)
- Must pass all AXE checks
- Proper focus management
- Sufficient color contrast
- Correct ARIA attributes

---

## How to Add a New Feature Store

1. Create `store/<feature>/` directory
2. Create `<feature>.actions.ts` using `createActionGroup`
3. Create `<feature>.reducer.ts` with `EntityAdapter` if collection-based
4. Create `<feature>.selectors.ts` with feature + derived selectors
5. Create `<feature>.effects.ts` with `inject()` pattern
6. Create `index.ts` barrel with `export type` for types
7. Add state & reducer to `app.state.ts`
8. Register effects in `store.config.ts`
9. Create corresponding service in `core/services/`

---

## Environment

- **Environment file**: `src/environments/environment.ts`
- **Firebase config** lives inside `environment.firebase`
- **PostCSS**: `.postcssrc.json` with `@tailwindcss/postcss`
- **Hosting**: Firebase Hosting + Vercel (auto-deploy on push)
- **Testing**: Vitest 4 + jsdom 28

---

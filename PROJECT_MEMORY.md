# AQDAS PROJECT MEMORY

> **IMPORTANT**: Always read this file before making any changes. Follow all conventions listed below.

---

## Project Overview

**Project Name:** Aqdas
**Type:** Scalable Angular + Firebase e-commerce PWA web application
**Architecture:** Modern frontend with NgRx state management, Tailwind CSS 4, GSAP animations, and Firebase backend services
**Firebase Plan:** Spark (Free) — structured for future scalability
**Brand:** Premium Kerala Cardamom & Spices e-commerce

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
| **GSAP**                   | latest    |
| **Lucide Angular**         | latest    |
| **Prettier**               | 3.8.1     |
| **Vitest**                 | 4.0.8     |
| **tslib**                  | ^2.3.0    |

---

## Theme & Brand

```
Primary:       #355E3B (Deep Cardamom Green)
Primary Dark:  #2A4B30
Primary Light: #4A7A53
Secondary:     #F8F5EE (Cream White)
Accent Gold:   #D4A017
Accent Dark:   #B58A13
Text Dark:     #1A1A1A
Cream:         #FFF9F0

Heading Font:  Playfair Display (serif)
Body Font:     Poppins (sans-serif)
```

Tailwind 4 theme configured in `src/styles.css` via `@theme` directive.

---

## Core Stack

### Frontend
- Angular 21 (standalone components — do NOT set `standalone: true`, it's the default)
- NgRx 21 (Store, Effects, Entity, Signals, Store DevTools)
- Angular Routing (lazy-loaded feature routes)
- Angular PWA (Service Worker)
- TypeScript 5.9 (strict mode)
- Tailwind CSS 4 (CSS-based @theme config)
- GSAP (scroll reveal, entrance animations, parallax)
- Lucide Angular (icons)
- Reactive Forms (not template-driven)

### Backend / Cloud
- Firebase SDK 12
- Firestore (primary database)
- Firebase Authentication (email/password + Google)
- Firebase Hosting
- Firebase Storage
- Realtime Database (optional)
- Firebase Cloud Messaging (future)

---

## Project Architecture

```
src/app/
├── app.config.ts           # Root providers (router, store, SW)
├── app.routes.ts            # Top-level lazy-loaded routes
├── app.ts                   # Root component (navbar + outlet + footer + WhatsApp)
├── app.css                  # Minimal root styles
│
├── core/                    # Singleton services & config (never re-imported)
│   ├── firebase/
│   │   └── firebase.config.ts    # Firebase app, auth, firestore, storage instances
│   └── services/
│       ├── auth.service.ts        # Firebase Auth → Observable wrappers
│       ├── product.service.ts     # Firestore CRUD → Observable wrappers (products, categories, testimonials, config)
│       ├── cart.service.ts        # Cart persistence (Firestore + localStorage fallback)
│       ├── wishlist.service.ts    # Wishlist persistence (Firestore + localStorage fallback)
│       ├── seed.service.ts        # One-time Firestore data seeder
│       └── index.ts
│
├── shared/                  # Reusable models, pipes, components, directives
│   └── models/
│       ├── product.model.ts       # Product, Category, Banner, Testimonial, SiteConfig
│       ├── user.model.ts
│       ├── cart.model.ts          # CartItem, WishlistItem
│       └── index.ts
│
├── layout/                  # App shell components
│   ├── navbar/navbar.ts          # Glassmorphism sticky navbar
│   └── footer/footer.ts          # Premium dark footer
│
├── features/                # Lazy-loaded feature pages
│   ├── home/
│   │   ├── home.ts                # Home page container
│   │   └── sections/
│   │       ├── hero-section.ts    # Dynamic from Firestore config
│   │       ├── featured-products.ts # NgRx + Firestore products
│   │       ├── categories-section.ts # Firestore categories
│   │       ├── about-section.ts
│   │       ├── testimonials-section.ts # Firestore testimonials
│   │       └── offer-banner.ts    # Dynamic countdown from Firestore
│   ├── shop/
│   │   ├── shop.ts                # Product grid with add-to-cart
│   │   └── product-detail.ts      # Full product page with qty/wishlist
│   ├── cart/cart.ts               # Cart page with qty controls + order summary
│   ├── wishlist/wishlist.ts       # Wishlist page with move-to-cart
│   ├── auth/
│   │   ├── login.ts               # Email/password + Google login
│   │   ├── register.ts            # Registration form
│   │   └── forgot-password.ts     # Password reset flow
│   ├── checkout/checkout.ts       # Shipping form & Order creation
│   ├── profile/profile.ts         # User account & Order history
│   └── admin/                     # Lazy-loaded Admin portal
│       ├── admin.routes.ts        # Admin routing
│       ├── layout/admin-layout.ts # Sidebar + Topbar
│       └── pages/                 # Dashboard, Products, Orders
└── store/                   # NgRx root store
    ├── store.config.ts       # provideAppStore() — all stores + effects
    ├── app.state.ts          # AppState: product, auth, ui, cart, wishlist
    ├── product/              # Product feature store (CRUD + entity)
    ├── auth/                 # Auth feature store (login, register, redirect)
    ├── ui/                   # UI/Layout feature store
    ├── cart/                 # Cart feature store (add, remove, qty, persist)
    └── wishlist/             # Wishlist feature store (add, remove, persist)
```

---

## Implementation Phases

### Phase 1: Foundation + Home Page ✅ COMPLETED
- [x] NgRx store setup (product, auth, ui)
- [x] Global styles & Tailwind 4 theme
- [x] Google Fonts (Playfair Display + Poppins)
- [x] Navbar (glassmorphism, sticky, mobile menu)
- [x] Footer (4-column, newsletter, social links)
- [x] Home page with all sections (hero, products, categories, about, testimonials, offer banner)
- [x] WhatsApp floating button
- [x] GSAP entrance animations
- [x] Lazy-loaded routing

### Phase 2: E-Commerce Core ✅ COMPLETED
- [x] All home page data dynamic from Firestore (hero, products, categories, testimonials, offers)
- [x] Images via Cloudinary URLs stored in Firestore
- [x] Shop page with product grid from Firestore
- [x] Product detail page (image, price, discount, weight, qty, stock)
- [x] Cart page (qty controls, remove, order summary, total)
- [x] Wishlist page (remove, move-to-cart)
- [x] Login page (email/password, Firebase Auth)
- [x] Register page (name/email/password)
- [x] NgRx cart store (add, update qty, remove, persist to Firestore/localStorage)
- [x] NgRx wishlist store (add, remove, persist to Firestore/localStorage)
- [x] Navbar shows dynamic cart count, wishlist count, user avatar
- [x] Auth redirect on login/register success
- [x] Firestore seed service (auto-populates if DB is empty)
- [x] Firestore rules deployed

### Phase 2: Shop & Product Pages ✅ COMPLETED
- [x] Shop page (product grid, filters, search, pagination)
- [x] Product detail page (gallery, reviews, related products)
- [x] Cart page (quantity, remove, coupon, total)
- [x] Firebase product data integration

### Phase 3: Auth & User ✅ COMPLETED
- [x] Login page (glassmorphism, email/Google)
- [x] Register page
- [x] Forgot password
- [x] User profile page
- [x] Order history integration
- [x] Wishlist page
- [x] Auth guards

### Phase 4: Admin Dashboard ✅ COMPLETED
- [x] Admin sidebar layout (`/admin`)
- [x] Product CRUD (NgRx integration)
- [x] Order management UI
- [x] Analytics dashboard (Stats & placeholders)

### Phase 5: Polish & Advanced Features ✅ COMPLETED
- [x] Checkout integration (Shipping form, COD, Firestore order creation)
- [x] Dark/light mode toggle
- [x] Progressive image loading (NgOptimizedImage)
- [x] Full PWA support (Service Worker & Manifest)

### Phase 6: UI/UX Master Polish ✅ COMPLETED
- [x] Global Layout & Spacing (Responsive paddings, max-widths, safe areas)
- [x] Typography & Readability (Fluid font sizes, line heights, contrast)
- [x] Component Sizing & Touch Targets (Button heights, input padding, mobile tap targets)
- [x] Responsive Grids & Alignments (Fixing overlaps, gaps across breakpoints)
- [x] Micro-interactions & Polish (Focus states, active states, icon scaling)

### Phase 7: Advanced UI/UX Delight ✅ COMPLETED
- [x] Toast Notification System (Global feedback for cart, auth, checkout)
- [x] Advanced GSAP Scroll Reveals (Staggered entrances as user scrolls down)
- [x] Branded Loading States (Replacing generic spinners with branded pulses)
- [x] Page Routing Transitions (Smooth fade between routes)

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
- **`createActionGroup`** for all action definitions
- **`createReducer` + `on`** for reducers — immutable state only
- **`@ngrx/entity`** (`EntityAdapter`) for all collection state
- **`createFeatureSelector` + `createSelector`** for all selectors (memoized)
- **Effects**: `inject()` for DI, `exhaustMap` for mutations, `switchMap` for reads
- **Services**: return `Observable<T>` wrapping Firebase SDK via `from()`
- **No non-serializable data** in store

### Animation Patterns
- Use GSAP for entrance animations, scroll reveals, and parallax
- Initialize GSAP in `afterNextRender()` callback
- Use CSS `@keyframes` for simple continuous animations (floating, pulsing)
- Use Tailwind transition utilities for hover/focus state changes

### State Management Rules
- Use `signal()` for **component-local** state
- Use **NgRx Store** for **shared/global** state (auth, products, UI)
- Use `computed()` for derived state
- Never use `mutate` on signals — use `update` or `set`

### File Organization
- **Feature pages**: `features/<feature>/` with lazy-loaded components
- **Feature stores**: `store/<feature>/` with actions, reducer, selectors, effects
- **Core services**: `core/services/` — singleton, `providedIn: 'root'`
- **Shared models**: `shared/models/` — plain interfaces only
- **Layout components**: `layout/` — navbar, footer, sidebar
- **Barrel exports**: Every directory gets an `index.ts` barrel file

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

## How to Add a New Feature Page

1. Create `features/<feature>/` directory
2. Create page component with `ChangeDetection.OnPush`
3. Add lazy-loaded route in `app.routes.ts`
4. Use GSAP in `afterNextRender()` for animations
5. Use Tailwind utility classes for styling
6. Import and dispatch NgRx actions as needed

---

## Firebase Collections

| Collection | Purpose            |
| ---------- | ------------------ |
| users      | User profiles      |
| products   | Product catalog    |
| categories | Product categories |
| orders     | Customer orders    |
| cart       | Shopping carts     |
| wishlist   | User wishlists     |
| reviews    | Product reviews    |
| coupons    | Discount codes     |
| banners    | Promotional banners|

---

## Environment

- **Environment file**: `src/environments/environment.ts`
- **Firebase config**: lives inside `environment.firebase`
- **PostCSS**: `.postcssrc.json` with `@tailwindcss/postcss`
- **Hosting**: Firebase Hosting + Vercel (auto-deploy on push)
- **Testing**: Vitest 4 + jsdom 28
- **Dev Server**: `ng serve` (default port 4200)

---

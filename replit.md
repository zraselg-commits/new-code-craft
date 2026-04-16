# rasel.cloud — Digital Agency Platform

A multi-language digital agency website and service-selling platform for Rasel Cloud, built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Firebase (Auth + Firestore).

## Architecture

- **Framework**: Next.js 14.2 App Router (SSR/SSG/SEO-ready)
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui (framer-motion fully removed — all animations use CSS @keyframes)
- **Backend**: Next.js API Route Handlers (`app/api/**`)
- **Database**: Firebase Firestore (via Firebase Admin SDK; `lib/firestore.ts`)
- **Auth**: JWT (localStorage `rc_auth_token`, 7-day expiry) + Firebase Google OAuth
- **Routing**: Next.js file-system routing (`app/**/page.tsx`)
- **State**: TanStack Query, Context API (LanguageContext, CurrencyContext, CartContext, AuthContext)

## Running the App

`next dev -p 5000` — starts the Next.js development server on port 5000.

Workflow: "Start application" → `next dev -p 5000`

## Key Scripts

- `npm run dev` — legacy (now runs next dev via workflow)
- `npm run build` — Next.js production build

## Database Seeding (Firestore)

To seed or reseed the Firestore database with 6 services and 18 packages:

```bash
# Via HTTP (requires SEED_SECRET env var to be set):
curl -X POST "https://<domain>/api/seed" -H "x-seed-key: <SEED_SECRET>"

# Or via query param:
curl -X POST "https://<domain>/api/seed?key=<SEED_SECRET>"
```

The seed is idempotent — it skips documents that already exist (matched by slug+tier).
`SEED_SECRET` is stored as a Replit secret; the endpoint returns 503 if the secret is not configured.

## Legacy Code

`server/` — contains legacy Express + Drizzle/PostgreSQL code from the previous architecture.
These files are **not used** by the Next.js App Router. All API routes live in `app/api/`.
The `server/` directory has TypeScript errors (Drizzle import mismatches) and should be
treated as deprecated/archived. Do not add new code here.

## Directory Structure

```
app/                      # Next.js App Router
  layout.tsx              # Root layout with Providers
  page.tsx                # Home route → src/pages/Index.tsx
  providers.tsx           # All context providers (client)
  globals.css             # Tailwind + custom CSS
  api/                    # Next.js API route handlers
    auth/signup|login|smart|google|phone|me|refresh/
    profile/              # GET/PATCH user profile (name, phone, avatarUrl)
    services/[slug]/
    orders/route.ts       # POST (auth required)
    orders/guest/         # POST (unauthenticated guest checkout)
    orders/mine/
    contacts/
    blog/[slug]/
    admin/stats|orders/[id]|users/[id]|services/[id]|packages/[id]|blog/[id]/
    seed/                 # Protected seed endpoint (key: rasel-cloud-seed-2026)
  services/[slug]/page.tsx
  pricing|portfolio|team|why-us|contact|about|faq|terms|privacy/page.tsx
  cart|checkout/page.tsx            # Open to guests (no ProtectedRoute)
  profile/page.tsx                  # Protected (ProtectedRoute wrapper)
  auth|login|signup/page.tsx
  admin/**/page.tsx                  # Admin (AdminRoute wrapper)
  not-found.tsx

src/
  pages/                  # Page components (all 'use client')
  components/             # Shared UI components
  contexts/               # React Context providers
  hooks/                  # Custom hooks
  lib/                    # Client-side utilities

lib/                      # Server-side utilities (used in API routes)
  db.ts                   # Safe stub (no longer used; Firestore replaced Drizzle)
  auth.ts                 # JWT sign/verify + requireAuth/requireAdmin
  firebase-admin.ts       # Firebase Admin SDK init (service account + JWKS fallback)
  firestore.ts            # Typed Firestore CRUD helpers for all 6 collections

server/
  schema.ts               # Legacy Drizzle schema (no longer used by Next.js routes)
```

## Firestore Collections

- `users` — registered users (role: "user" | "admin"), nullable passwordHash, googleId, avatarUrl (DiceBear URL or base64 data URL), phone
- `services` — service offerings (slug, category, tags, imageUrl, isActive)
- `packages` — 3 tiers per service (starter/professional/enterprise, price, features, deliveryDays)
- `orders` — placed orders linked to user, service, package; includes paymentMethod ("stripe" | "bkash") field
- `contacts` — contact form submissions
- `blogPosts` — blog articles (slug, title, content, published, tags[])

## API Endpoints

### Auth
- `POST /api/auth/signup` — register with name/email/password (auto-assigns DiceBear avatarUrl)
- `POST /api/auth/login` — login, returns JWT
- `POST /api/auth/smart` — smart login/signup detection (email-based)
- `POST /api/auth/google` — Google Firebase token exchange (auto-assigns Google photo or DiceBear avatarUrl)
- `POST /api/auth/phone` — phone number login or signup (action: "signup" for registration)
- `GET /api/auth/me` — get current user with avatarUrl and phone (requires auth)
- `POST /api/auth/refresh` — refresh JWT token
- `GET /api/profile` — get full user profile
- `PATCH /api/profile` — update name, phone, or avatarUrl (base64 data URL, max 200KB original file)

### Public
- `GET /api/services` — list all active services with packages
- `GET /api/services/:slug` — single service detail with packages
- `POST /api/contacts` — submit contact form
- `GET /api/blog` — list published blog posts
- `GET /api/blog/:slug` — single blog post

### Authenticated (user)
- `POST /api/orders` — place an order (requires auth; supports paymentMethod: "stripe" | "bkash")
- `POST /api/orders/guest` — place a guest order without login (auto-creates account with password "123456" if new phone/email)
- `GET /api/orders/mine` — get own orders

### Admin (role=admin required)
- `GET /api/admin/stats` — dashboard stats (orders, users, revenue)
- `GET|POST /api/admin/services` — list/create services
- `PUT|DELETE /api/admin/services/:id` — update/delete service
- `GET|POST /api/admin/packages` — list/create packages
- `PUT|DELETE /api/admin/packages/:id` — update/delete package
- `GET /api/admin/orders` — list all orders
- `GET|PATCH /api/admin/orders/:id` — get/update order status
- `GET /api/admin/users` — list users
- `PATCH /api/admin/users/:id` — update user role
- `GET|POST /api/admin/blog` — list all posts / create post
- `PATCH|DELETE /api/admin/blog/:id` — update/delete post

### Utility
- `POST /api/seed?key=rasel-cloud-seed-2026` — seed Firestore with services + packages

## Pages

### Public
- `/` — Home with dynamic ServicesSection
- `/services` — DB-driven services listing
- `/services/[slug]` — Service detail with 3 package cards
- `/pricing` — All services with pricing tiers
- `/blog`, `/blog/[slug]` — Blog listing + detail (ISR)
- `/portfolio`, `/team`, `/why-us`, `/contact` — Static content pages
- `/about`, `/faq`, `/terms`, `/privacy` — Info pages
- `/auth` — Smart login/signup (combined flow)
- `/login`, `/signup` — Separate auth pages

### Open to all (including guests)
- `/cart` — Shopping cart (guests can view)
- `/checkout` — Place order from cart (guests shown modal for phone/email; auto-creates account)

### Protected (requires login)
- `/profile` — Order history

### Admin (requires role=admin)
- `/admin` — Overview with stats + recent orders
- `/admin/services` — CRUD services + packages
- `/admin/orders` — All orders with inline status update
- `/admin/users` — All users with role toggle
- `/admin/blog` — Blog post CRUD

## Key Files

- `src/contexts/AuthContext.tsx` — JWT auth state, login/signup/logout
- `src/contexts/CartContext.tsx` — Cart with serviceId/packageId/price
- `src/contexts/CurrencyContext.tsx` — BDT/USD switcher (localStorage)
- `src/contexts/LanguageContext.tsx` — EN/BN/HI i18n translations
- `src/lib/api.ts` — apiFetch with 401 auto-refresh
- `src/hooks/useServices.ts` — TanStack Query hooks for services
- `src/components/AdminRoute.tsx` — Admin-only route guard
- `src/components/ProtectedRoute.tsx` — Auth-only route guard
- `src/components/admin/AdminLayout.tsx` — Admin sidebar + layout
- `lib/auth.ts` — JWT helpers + requireAuth/requireAdmin for API routes
- `lib/firebase-admin.ts` — Firebase Admin SDK (service account + JWKS fallback for auth)
- `lib/firestore.ts` — Full Firestore CRUD service layer
- `next.config.mjs` — Next.js config (maps VITE_ → NEXT_PUBLIC_ env vars)

## Environment Variables

### Firebase Admin (server-side — Replit Secrets)
- `FIREBASE_CLIENT_EMAIL` — service account client email
- `FIREBASE_PRIVATE_KEY` — service account private key (with literal `\n` chars)
- `FIREBASE_PROJECT_ID` OR `VITE_FIREBASE_PROJECT_ID` — Firebase project ID

### Firebase Client (browser + server — Replit Secrets)
- `VITE_FIREBASE_API_KEY` / `FIREBASE_WEB_API_KEY` — web API key
- `VITE_FIREBASE_AUTH_DOMAIN` — auth domain
- `VITE_FIREBASE_PROJECT_ID` — project ID
- `VITE_FIREBASE_APP_ID` / `FIREBASE_WEB_APP_ID` — app ID

All `VITE_*` vars are mapped to `NEXT_PUBLIC_*` equivalents in `next.config.mjs`.

### Auth
- `JWT_SECRET` — JWT signing secret (falls back to a hardcoded dev value if not set)

## Admin Access

Admin user email: `admin@rasel.cloud` (role must be set to "admin" in Firestore users collection)

## Migration History

1. Migrated from Lovable (Supabase) → Replit (PostgreSQL + Express)
2. Migrated from Vite+React+Express → Next.js 14 App Router
3. Migrated from PostgreSQL/Drizzle → Firebase Firestore (Task #3)
   - `lib/firestore.ts` — typed CRUD for all 6 collections
   - `lib/firebase-admin.ts` — Admin SDK with service account + JWKS fallback
   - `lib/auth.ts` — reads JWT from Bearer header AND `rc_auth_token` cookie
   - All API routes updated; Drizzle imports replaced with Firestore helpers
   - `lib/db.ts` is now a safe stub (`export {}`)
   - Seed endpoint: `POST /api/seed?key=rasel-cloud-seed-2026`

## Blog System

- **Collection**: `blogPosts` (id, slug, title, excerpt, content, coverImage, tags[], published, publishedAt, authorId, createdAt, updatedAt)
- **Public API**: `GET /api/blog` (published posts), `GET /api/blog/[slug]` (single post); ISR with revalidate=3600
- **Admin API**: `GET|POST /api/admin/blog`, `PATCH|DELETE /api/admin/blog/[id]`; admin-only
- **Pages**: `/blog` (ISR grid), `/blog/[slug]` (SSG + generateStaticParams + JSON-LD Article)
- **Admin**: `/admin/blog` — full CRUD with create/edit dialog, publish toggle, delete confirm

## SEO System

- **sitemap.xml**: `app/sitemap.ts` — auto-generated, includes static routes + service slugs + blog slugs
- **robots.txt**: `app/robots.ts` — disallows /admin, /api/, /checkout, /profile
- **Per-page metadata**: Every page exports `metadata` or `generateMetadata` with OG tags + Twitter cards
- **JSON-LD**: Organization schema on homepage, BlogPosting schema on blog posts

## Performance Optimizations

- **Image optimization**: Next.js image optimization with AVIF/WebP, 24h cache TTL
- **Query caching**: TanStack Query staleTime=5min, gcTime=30min
- **API caching**: Cache-Control headers on public API routes
- **Fonts**: `next/font/google` (Inter) — self-hosted, zero layout shift
- **CSS-only animations**: framer-motion fully removed; CSS @keyframes with prefers-reduced-motion
- **Loading skeletons**: `loading.tsx` for all major routes
- **Bundle optimizer**: `experimental.optimizePackageImports` for lucide-react, tanstack, date-fns

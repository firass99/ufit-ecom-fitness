# UFitPal

Athlete health tracker and e-commerce store for more efficient training.

A pnpm + Turborepo monorepo containing a NestJS REST API, a Next.js 15 storefront with an
embedded admin dashboard, and a shared Prisma data layer.

---

## Contents

- [Architecture](#architecture)
- [Workspace map](#workspace-map)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Practices and conventions](#practices-and-conventions)
- [Domain model](#domain-model)
- [Known gaps](#known-gaps)

---

## Architecture

```
                    ┌──────────────────────────────┐
  browser  ───────► │  ecom-store  (Next.js :8000) │
                    │  ├─ (main)      storefront    │
                    │  ├─ (dashboard) admin/athlete │
                    │  └─ middleware  edge JWT      │
                    └──────────┬───────────────────┘
                               │  Server Actions (server-side fetch)
                               ▼
                    ┌──────────────────────────────┐
                    │  api  (NestJS :5000)          │
                    │  ├─ Passport: JWT + OAuth     │
                    │  ├─ Prisma  ──► PostgreSQL    │
                    │  ├─ Meilisearch ──► search    │
                    │  └─ /uploads  static files    │
                    └──────────────────────────────┘
```

Two independent deployables. The storefront never talks to PostgreSQL directly — all reads
and writes go through the API over HTTP. The browser is not supposed to call the API
directly either: requests originate from Next.js Server Actions so the access token stays
in an `httpOnly` cookie and never reaches client JavaScript.

### Session flow

1. User authenticates against the API (email magic link, Google, or Facebook OAuth).
2. The API issues a short-lived **access token** and a **refresh token**, and persists a
   `Session` row holding the argon2 hash of the refresh token.
3. The storefront wraps the user claims in its own `session` JWT (signed with
   `SESSION_SECRET_KEY` via `jose`) and sets it as an `httpOnly` cookie.
4. [`middleware.ts`](apps/ecom-store/middleware.ts) verifies that cookie **at the edge** on
   every request and redirects by role before any layout renders.

Keeping the guard in middleware means an unauthorized request never pays for a server
render, and role routing happens in one place rather than in each layout.

---

## Workspace map

### Apps

| App                                  | Stack         | Port   | Purpose                               |
| ------------------------------------ | ------------- | ------ | ------------------------------------- |
| [`apps/api`](apps/api)               | NestJS 11     | `5000` | REST API, auth, business logic        |
| [`apps/ecom-store`](apps/ecom-store) | Next.js 15    | `8000` | Storefront + admin/athlete dashboards |
| [`apps/studio`](apps/studio)         | Prisma Studio | `3005` | Database browser (dev only)           |

### Packages

Actively used:

| Package                   | Purpose                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `@repo/database`          | Prisma schema, generated client, migrations — the single source of truth for the data model |
| `@repo/design-system`     | shadcn/ui component library (109 import sites)                                              |
| `@repo/tailwind-config`   | Shared Tailwind theme and design tokens                                                     |
| `@repo/typescript-config` | Shared `tsconfig` bases                                                                     |

The remaining 13 packages (`ai`, `analytics`, `email`, `env`, `feature-flags`,
`next-config`, `observability`, `security`, `seo`, `storage`, `testing`, `webhooks`) are
scaffolding inherited from the `next-forge` template and are **not imported by any app**.
Treat them as unwired until proven otherwise.

---

## Tech stack

**Shared tooling**

- [pnpm](https://pnpm.io) `10.2.1` workspaces — Node `>=18`
- [Turborepo](https://turbo.build) — task graph, caching, `dependsOn` ordering
- TypeScript `5.7.3` (pinned repo-wide via a pnpm override)
- Prettier + ESLint 9, Husky git hooks, [gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli) for commits

**API** — NestJS 11 · Prisma 6.3 · PostgreSQL · Passport (JWT, Google, Facebook) · argon2 ·
Meilisearch · Swagger · Helmet · Throttler · Multer · Nodemailer

**Storefront** — Next.js 15.1 App Router · React 19 · Tailwind 3.4 · shadcn/ui ·
next-intl (en/ar + RTL) · Zustand · React Hook Form + Zod · Recharts · Embla · jose

See each app's README for detail.

---

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

The API validates its environment **at boot** and refuses to start if anything is missing
or if a secret is under 32 characters — see
[`env.validation.ts`](apps/api/src/config/env.validation.ts). Create `apps/api/.env` with
at minimum:

```ini
DATABASE_URL=postgresql://user:pass@localhost:5432/ufitpal
JWT_SECRET=                 # >= 32 chars
REFRESH_JWT_SECRET=         # >= 32 chars
SESSION_SECRET=             # >= 32 chars
API_BASE_URL=http://localhost:5000
UFITPAL_FRONT=http://localhost:8000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MEILI_ADMIN_API_KEY=
```

And `apps/ecom-store/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
SESSION_SECRET_KEY=         # signs the storefront session cookie
```

Generate a secret with `openssl rand -base64 48`.

### 3. Set up the database

```bash
pnpm migrate      # prisma format + generate + db push
```

### 4. Run

```bash
pnpm dev          # api + ecom-store + studio together
```

| URL                       | What          |
| ------------------------- | ------------- |
| http://localhost:8000     | Storefront    |
| http://localhost:5000     | API           |
| http://localhost:5000/api | Swagger docs  |
| http://localhost:3005     | Prisma Studio |

**Both apps must be running.** The storefront renders through Server Actions that call the
API, so with the API down every product page fails. If a request to
`http://localhost:5000/...` hangs, check the API is actually listening before debugging
anything else:

```bash
netstat -ano | grep LISTENING | grep :5000
```

### Root scripts

| Script                                 | Does                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| `pnpm dev`                             | Runs api, studio, ecom-store via Turbo                   |
| `pnpm build`                           | Builds everything (`db:generate` → `build` → `test`)     |
| `pnpm migrate`                         | Prisma format + generate + `db push`                     |
| `pnpm db:generate` / `pnpm db:migrate` | Targeted Prisma tasks                                    |
| `pnpm lint`                            | ESLint (currently filtered to `api` only)                |
| `pnpm format`                          | Prettier across the repo                                 |
| `pnpm commit`                          | Guided gitmoji commit                                    |
| `pnpm bump-deps`                       | `npm-check-updates` across all workspaces                |
| `pnpm bump-ui`                         | Re-sync all shadcn components into `@repo/design-system` |

---

## Practices and conventions

### Data access

- **The Prisma schema is the contract.** Enums (`Role`, `Currency`, `Size`, `Gender`,
  `OrderStatus`, `PaymentStatus`, `DiscountType`) are defined once in
  `packages/database/prisma/schema.prisma` and imported by both apps. Don't re-declare them
  as string unions.
- The API owns all database access. The storefront has no Prisma client at runtime.
- Storefront data fetching lives in `apps/ecom-store/lib/actions/*` as `'use server'`
  modules, tagged for revalidation (`next: { tags: ['products'] }`) so writes can call
  `revalidateTag` instead of busting whole paths.

### Security

- Access tokens live in `httpOnly` cookies — never in `localStorage` or client state.
- Refresh tokens are **argon2-hashed** before being stored in the `Session` table, so a
  database leak does not yield usable tokens.
- Route protection happens at the edge in middleware, plus `JwtAuthGuard` + `RolesGuard` on
  the API. Both layers are required: the middleware is UX, the guards are enforcement.
- The API runs `ValidationPipe` with `whitelist` **and** `forbidNonWhitelisted`, so
  undeclared payload fields are rejected rather than silently dropped.
- CORS is an explicit allowlist from `UFITPAL_FRONT` / `UFITPAL_DASH`; localhost origins are
  added only when `NODE_ENV !== 'production'`.
- Global rate limit: 100 requests / 60s.

### Internationalization

- `next-intl` with `en` and `ar`; all routes are locale-prefixed (`/[locale]/...`).
- Arabic requires RTL — layout direction is driven by locale, so prefer logical Tailwind
  utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`) over `ml-*` / `mr-*`.
- Content is translated in the **database**, not just the UI: `ProductTranslation`,
  `CategoryTranslation`, and `NotificationTranslations` hold per-locale rows.
- UI strings live in `apps/ecom-store/messages/{en,ar}.json`.

### Multi-currency

Prices are stored per currency, not converted at render time. `ProductPrice` and
`VariantPrice` hold a row per `Currency` (`USD`, `EUR`, `TND`, `AED`, `SAR`) with optional
`salePrice` and a sale window. The selected currency is kept in a cookie and read by
`lib/store/useCurrencyStore.ts`.

### Conventions

- **Files**: kebab-case (`product-grid.tsx`). Route folders are kebab-case too.
- **Colocation**: route-specific components go in `_ui/` next to the route; genuinely shared
  ones go in `components/`.
- **Client boundaries**: keep `'use client'` on the smallest interactive leaf. Marking a page
  shell as a client component drags its whole subtree into the bundle.
- **Styling**: use tokens from `@repo/tailwind-config`. No hardcoded hex colors.
- **Commits**: gitmoji via `pnpm commit`.

---

## Domain model

27 Prisma models. The commerce core:

```
Brand ──┐
        ├──► Product ──► Variant ──► VariantPrice
Category┘      │  └────► ProductPrice
               └──► ProductTranslation        (per-locale name/description)

User ──► Cart ──► CartItem ──► Variant
  │  └──► Order ──► OrderItem
  │        └──► Payment
  ├──► Session                                (argon2 refresh-token hashes)
  └──► Athlete | Coach | Nutritionist         (role-specific profiles)

Promo                                          (PERCENTAGE | FIXED discounts)
```

`User.role` is one of `ADMIN`, `ATHLETE`, `NUTRITIONIST`, `COACH`, and drives both the
post-login landing route and dashboard access.

---

## Known gaps

Documented honestly so nobody rediscovers them the hard way:

- **`admin/` and `athlete/` dashboards are a copy-paste fork.** Several route files are
  byte-identical across the two, and some have already drifted. A fix in one needs applying
  in both until they're consolidated.
- **No shared API client.** `NEXT_PUBLIC_API_URL` is re-declared in ~13 files and each
  server action hand-rolls `fetch` + error handling + an untyped `res.json()`. A single
  typed `request<T>()` helper would remove most of it.
- **Some client components call the API directly**, bypassing the Server Action layer and
  its cookie handling. Those are the files to migrate first.
- **High client-component ratio** (~65% of components are `'use client'`), which forfeits
  much of the App Router's server-rendering benefit.
- **~66 outstanding TypeScript errors**, some in `packages/design-system` and
  `packages/tailwind-config` from dependency version drift (`react-day-picker` vs React 19,
  a `darkMode` tuple, a typography plugin signature).
- **No test suite.** Turbo wires up a `test` task and `build` depends on it, but no app
  defines real tests.

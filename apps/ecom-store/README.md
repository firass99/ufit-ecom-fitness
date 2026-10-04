# UFitPal Storefront

Next.js 15 App Router application serving three surfaces from one codebase: the customer
storefront, the admin dashboard, and the athlete dashboard.

Runs on **port 8000** with Turbopack in development.

> Requires the API to be running on port 5000. Pages render through Server Actions that
> fetch from it, so with the API down the catalog pages fail.

---

## Contents

- [Running it](#running-it)
- [Environment](#environment)
- [Route structure](#route-structure)
- [Edge auth middleware](#edge-auth-middleware)
- [Data fetching](#data-fetching)
- [State management](#state-management)
- [Internationalization](#internationalization)
- [Multi-currency pricing](#multi-currency-pricing)
- [UI layer](#ui-layer)
- [Conventions](#conventions)

---

## Running it

From the repo root, which also starts the API:

```bash
pnpm dev
```

Or just this app:

```bash
pnpm --filter ecom-store dev
```

| Script        | Does                               |
| ------------- | ---------------------------------- |
| `pnpm dev`    | `next dev --turbopack -p 8000`     |
| `pnpm build`  | Production build                   |
| `pnpm start`  | Serve the build on `:8000`         |
| `pnpm lint`   | `next lint`                        |
| `pnpm format` | Prettier over `ts,tsx,md,mdx,json` |

---

## Environment

`apps/ecom-store/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
SESSION_SECRET_KEY=         # signs the session cookie — min 32 chars
```

`SESSION_SECRET_KEY` is read by both [`middleware.ts`](middleware.ts) and
[`lib/actions/session.ts`](lib/actions/session.ts). If they disagree, every session fails
verification and users get bounced to `/account` in a loop.

---

## Route structure

Three route groups under `app/[locale]/`. Groups organize without adding URL segments, which
lets the storefront and the dashboards have entirely separate layouts at the same URL depth.

```
app/[locale]/
├── layout.tsx                 root: locale, theme, RTL direction
│
├── (main)/                    ── public storefront
│   ├── page.tsx                  landing
│   ├── products/
│   │   ├── page.tsx              catalog, filters read from searchParams
│   │   └── [id]/page.tsx         product detail
│   ├── checkout/
│   ├── account/                  login page
│   ├── about/  services/
│   └── loading.tsx  not-found.tsx
│
├── (dashboard)/               ── authenticated, role-gated
│   ├── admin/                    products, categories, brands, orders,
│   │                             promotions, users, profile
│   └── athlete/                  orders, myOrders, profile, users
│
└── (api)/auth/                ── route handlers
    ├── socials/callback/         receives OAuth result, mints the session
    ├── link/callback/            magic-link landing
    ├── refreshToken/
    └── logout/
```

Each dashboard section follows the same shape: `page.tsx` (overview with charts),
`list/page.tsx` (table), `add/page.tsx`, `[id]/page.tsx` (edit). Charts and section-specific
pieces live in a colocated `_ui/` folder.

> **Heads up:** `admin/` and `athlete/` are currently a copy-paste fork of each other, with
> several byte-identical files. Changes to shared behavior need applying in both until
> they're consolidated.

---

## Edge auth middleware

[`middleware.ts`](middleware.ts) composes `next-intl` locale routing with session
verification, and runs before any render.

```
request
  ├─ no locale prefix        → next-intl adds one
  ├─ /account  + session     → redirect to the role's home
  ├─ /admin/*  no session    → /account
  ├─ /admin/*  role ≠ ADMIN  → /
  ├─ /athlete/* no session   → /account
  ├─ /athlete/* role ≠ ATHLETE → /
  └─ otherwise               → next-intl
```

The session cookie is a JWT verified with `jose` (`HS256`). Two reasons this lives at the
edge rather than in layouts:

1. An unauthorized request never pays for a layout render before being turned away.
2. Role→landing-page routing (`homeFor()`) is defined once instead of in each dashboard.

The middleware is UX and cost control, **not** the security boundary — the API's
`JwtAuthGuard` + `RolesGuard` is. Both layers are required.

---

## Data fetching

Server Actions in [`lib/actions/`](lib/actions), one module per domain, each marked
`'use server'`.

```
lib/actions/
├── products.ts  categories.ts  brands.ts  promotions.ts
├── carts.ts  orders.ts
├── users.ts  athletes.ts  coachs.ts  nutritionists.ts
├── auth.ts  session.ts
└── analytics/        dashboard aggregate fetchers
```

Keeping fetches server-side means the access token stays in an `httpOnly` cookie and never
reaches client JavaScript.

### Caching

Reads are tagged so writes can invalidate precisely:

```ts
const res = await fetch(`${API_URL}/products?${qs}`, {
  next: { revalidate: 60, tags: ['products'] },
});
```

A mutation then calls `revalidateTag('products')` rather than `revalidatePath`, so unrelated
pages keep their cache.

### Filters as URL state

[`products/page.tsx`](app/%5Blocale%5D/%28main%29/products/page.tsx) derives its filter DTO from
`searchParams` rather than client state. Filters are shareable, bookmarkable, and
server-rendered — and the page stays a server component.

> **Known gaps.** `NEXT_PUBLIC_API_URL` is re-declared in ~13 files and every action
> hand-rolls `fetch` + `if (!res.ok) throw` + an untyped `res.json()`. A few _client_
> components also call the API directly, bypassing this layer and its cookie handling. A
> single typed `request<T>()` helper is the intended fix.

---

## State management

Server state is the default — most data comes from Server Actions and needs no client store.
Zustand covers only what must persist across navigation:

| Store                                                            | Holds                                   |
| ---------------------------------------------------------------- | --------------------------------------- |
| [`lib/store/cartStore.ts`](lib/store/cartStore.ts)               | Cart contents and optimistic updates    |
| [`lib/store/useCurrencyStore.ts`](lib/store/useCurrencyStore.ts) | Selected currency, mirrored to a cookie |

The cookie mirror is what lets the server render prices in the right currency on first paint.

> `useCurrencyStore` reads `document.cookie` at module-initialization time, which can
> mismatch what the server rendered. Worth moving to an init-from-props or `useEffect`
> pattern.

---

## Internationalization

`next-intl`, configured in [`i18n/routing.ts`](i18n/routing.ts).

- Locales: **`en`**, **`ar`** — default `en`. All routes are locale-prefixed.
- UI strings: [`messages/en.json`](messages/en.json), [`messages/ar.json`](messages/ar.json).
- Navigation helpers (`Link`, `redirect`, `usePathname`, `useRouter`) come from
  `createNavigation(routing)` — **import those, not `next/link`**, or locale prefixes get
  dropped.
- Content translation happens in the database (`ProductTranslation`,
  `CategoryTranslation`), so product names and descriptions are localized server-side rather
  than through message files.

### RTL

Arabic needs right-to-left. Direction is set from the locale and there's an
[`rtl-wrapper.tsx`](components/ui/rtl-wrapper.tsx) helper. **Use logical Tailwind utilities**
— `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*` — not `ml-*` / `mr-*` / `left-*`, which
don't flip.

---

## Multi-currency pricing

Five currencies: `USD`, `EUR`, `TND`, `AED`, `SAR`.

Prices are **stored per currency**, not converted at display time — `ProductPrice` and
`VariantPrice` each hold a row per currency with an optional `salePrice` and sale window.
That avoids live FX rates and lets each market be priced deliberately.

[`lib/util/pick-price.ts`](lib/util/pick-price.ts) resolves the right row, preferring
`salePrice` over `price`.

> This helper is `any`-typed and returns `0` when no row matches the selected currency,
> which displays a free product rather than an error. Worth tightening.

---

## UI layer

- **[`@repo/design-system`](../../packages/design-system)** — shadcn/ui components, the
  primary source (109 import sites). Add components with `pnpm bump-ui` from the root.
- **`components/ui/`** — a small number of app-local additions (currency selector, language
  dropdown, RTL wrapper, chart wrappers).
- **Tailwind 3.4** via `@repo/tailwind-config`. Theme tokens are shared; there is exactly one
  hardcoded hex color in the app and it should stay that way.
- **Dark mode** through `next-themes`.

| Concern         | Library                                             |
| --------------- | --------------------------------------------------- |
| Forms           | `react-hook-form` + `zod` via `@hookform/resolvers` |
| Tables          | `@tanstack/react-table`                             |
| Charts          | `recharts`                                          |
| Carousels       | `embla-carousel-react` + autoplay                   |
| Toasts          | `sonner`                                            |
| Drawers         | `vaul`                                              |
| Command palette | `cmdk`                                              |
| Drag & drop     | `@dnd-kit`                                          |
| Icons           | `lucide-react`, `react-icons`                       |
| Search client   | `meilisearch`                                       |

---

## Conventions

- **Files**: kebab-case (`product-grid.tsx`, `add-to-cart-button.tsx`).
- **Colocation**: route-specific components in `_ui/` beside the route; shared ones in
  `components/`. `components/sections/` holds landing-page sections.
- **Client boundaries**: put `'use client'` on the smallest interactive leaf. Marking a page
  shell drags the whole subtree into the bundle — currently ~65% of components are client
  components, which forfeits much of the App Router's benefit. Push boundaries down.
- **Types**: import enums and models from `@repo/database` / Prisma. `lib/types/` is for
  view-models only, not re-declarations of `Role` or `Currency`.
- **Mutations**: Server Action → API → `revalidateTag`. Don't fetch the API from a client
  component.
- **Styling**: theme tokens only, no raw hex. Logical properties for RTL.

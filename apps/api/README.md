# UFitPal API

REST API for the UFitPal storefront and dashboards. NestJS 11 on Express, Prisma over
PostgreSQL, Passport for authentication, Meilisearch for product search.

Runs on **port 5000** (`PORT` env overrides). Swagger UI at **http://localhost:5000/api**.

---

## Contents

- [Running it](#running-it)
- [Environment](#environment)
- [Module layout](#module-layout)
- [Authentication](#authentication)
- [Security posture](#security-posture)
- [Search](#search)
- [File uploads](#file-uploads)
- [Conventions](#conventions)

---

## Running it

From the repo root (preferred — starts the storefront too):

```bash
pnpm dev
```

Or just this app:

```bash
pnpm --filter api dev      # nest start --watch
```

| Script                   | Does                   |
| ------------------------ | ---------------------- |
| `pnpm dev` / `start:dev` | Watch mode             |
| `pnpm build`             | `nest build` → `dist/` |
| `pnpm start:prod`        | `node dist/main`       |
| `pnpm start:debug`       | Watch + `--inspect`    |
| `pnpm lint`              | ESLint with `--fix`    |
| `pnpm test`              | Jest unit tests        |
| `pnpm test:e2e`          | Jest e2e config        |

---

## Environment

**The API validates its environment at boot and throws before listening** if anything is
missing, or if `JWT_SECRET` / `REFRESH_JWT_SECRET` / `SESSION_SECRET` are shorter than 32
characters. See [`src/config/env.validation.ts`](src/config/env.validation.ts).

This is deliberate: a missing OAuth secret should fail loudly at startup, not produce a
confusing redirect loop at runtime. If the process exits immediately on `pnpm dev`, read the
error — it names exactly which variables are at fault.

Required in `apps/api/.env`:

| Variable                                                  | Notes                                                 |
| --------------------------------------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`                                            | PostgreSQL connection string                          |
| `JWT_SECRET`                                              | Access token signing key — min 32 chars               |
| `REFRESH_JWT_SECRET`                                      | Refresh token signing key — min 32 chars              |
| `SESSION_SECRET`                                          | min 32 chars                                          |
| `API_BASE_URL`                                            | e.g. `http://localhost:5000`                          |
| `UFITPAL_FRONT`                                           | Storefront origin — used for CORS and OAuth redirects |
| `GOOGLE_CLIENT_ID` / `_SECRET` / `_CALLBACK_URL`          | Google OAuth                                          |
| `FACEBOOK_CLIENT_ID` / `_SECRET` / `_CALLBACK_URL`        | Facebook OAuth                                        |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASSWORD` | Nodemailer, for magic-link login                      |
| `MEILI_ADMIN_API_KEY`                                     | Meilisearch admin key                                 |

Optional: `PORT` (default `5000`), `UFITPAL_DASH` (extra CORS origin), `NODE_ENV`.

Generate secrets with `openssl rand -base64 48`.

---

## Module layout

Standard Nest feature-module structure — each folder is a `*.module.ts` plus its controller,
service, and DTOs.

```
src/
├── main.ts                  bootstrap: Swagger, CORS, pipes, helmet, cookies
├── app.module.ts            root module, global ConfigModule + ThrottlerGuard
├── config/
│   └── env.validation.ts    fail-fast env check
├── database/                PrismaService wrapper over @repo/database
├── auth/                    ← see below
├── sessions/                refresh-token session records
├── users/
├── athletes/  coachs/  nutritionists/     role-specific profiles
├── products/  variants via Prisma
├── categories/  brands/  promotions/
├── carts/  orders/  payments/
├── analytics/               dashboard aggregate queries
├── meilisearch/             search index client
└── multer/                  upload handling
```

### Domain modules at a glance

| Module       | Responsibility                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `products`   | Catalog CRUD, filtering (size, gender, brand, category, availability, price sort), per-locale translations, per-currency pricing |
| `carts`      | Cart + cart items, keyed to a user and a currency                                                                                |
| `orders`     | Order lifecycle — `PENDING` → `DELIVERED` / `CANCELLED`                                                                          |
| `payments`   | Payment records with `PENDING` → `PROCESSING` → `SUCCEEDED` / `FAILED` / `REFUNDED`                                              |
| `promotions` | `Promo` codes, `PERCENTAGE` or `FIXED` discount                                                                                  |
| `analytics`  | Aggregations backing the admin dashboard charts                                                                                  |
| `sessions`   | One row per active login, holding the argon2 refresh-token hash                                                                  |

---

## Authentication

`@Controller('auth')` — all routes below are prefixed `/auth`.

| Route                                  | Guard                         | Purpose                        |
| -------------------------------------- | ----------------------------- | ------------------------------ |
| `GET /auth/google/login`               | `GoogleAuthGuard`             | Starts Google OAuth            |
| `GET /auth/google/callback`            | `GoogleAuthGuard`             | Google redirect target         |
| `GET /auth/facebook/login`             | `FacebookAuthGuard`           | Starts Facebook OAuth          |
| `GET /auth/facebook/callback`          | `FacebookAuthGuard`           | Facebook redirect target       |
| `POST /auth/link/login`                | —                             | Request an email magic link    |
| `GET /auth/link/callback`              | —                             | Consume the magic-link token   |
| `POST /auth/refresh`                   | `RefreshJwtGuard`             | Rotate tokens                  |
| `GET /auth/profile`                    | `JwtAuthGuard`                | Current user                   |
| `POST /auth/logout`                    | `JwtAuthGuard`                | End this session               |
| `POST /auth/logout-all`                | `JwtAuthGuard`                | End every session for the user |
| `GET /auth/admin` · `/user` · `/multi` | `JwtAuthGuard` + `RolesGuard` | Role-gate probes               |

### Passport strategies

Four, in [`src/auth/strategies/`](src/auth/strategies):

- `jwt.strategy.ts` — validates the access token
- `refresh.strategy.ts` — validates the refresh token
- `google.strategy.ts` — `passport-google-oauth20`
- `facebook.strategy.ts` — `passport-facebook`

Config is bound through typed factories in [`src/auth/configs/`](src/auth/configs) and
registered in `ConfigModule.forRoot({ load: [...] })`, so strategies receive
`ConfigType<typeof jwtConfig>` rather than reading `process.env` directly.

### Token rotation

1. On login, `generateTokens()` issues an access token and a refresh token.
2. The refresh token is hashed with **argon2** and stored on a `Session` row — the plaintext
   is only ever sent to the client.
3. `POST /auth/refresh` verifies the presented token against the stored hash with
   `argon2.verify`, then issues a fresh pair and replaces the stored hash.

So a database compromise does not hand an attacker usable refresh tokens, and rotation
invalidates the previous token on every refresh.

### Role authorization

`Role` comes from the Prisma enum: `ADMIN`, `ATHLETE`, `NUTRITIONIST`, `COACH`.

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get('admin')
getAdminArea() { /* ... */ }
```

`RolesGuard` reads the `@Roles()` metadata; without `JwtAuthGuard` in front of it there is no
user to check, so the two always pair.

---

## Security posture

Configured in [`src/main.ts`](src/main.ts) and `app.module.ts`:

- **Helmet**, with `crossOriginResourcePolicy: 'cross-origin'` so the storefront on a
  different port can load `/uploads` images.
- **CORS allowlist** built from `UFITPAL_FRONT` and `UFITPAL_DASH`. `localhost:8000` and
  `localhost:9000` are appended only when `NODE_ENV !== 'production'`. `credentials: true`,
  since auth rides on cookies.
- **Global `ValidationPipe`** with `transform`, `whitelist`, and `forbidNonWhitelisted`.
  Unknown payload properties cause a 400 rather than being stripped silently — which means
  a renamed DTO field surfaces as a test failure instead of a null column.
- **Global `ThrottlerGuard`** — 100 requests per 60s, registered via `APP_GUARD`.
- **`cookie-parser`** for reading the auth cookies.
- **argon2** for all password and refresh-token hashing. No bcrypt, no plaintext.

---

## Search

Meilisearch, wrapped in `MeilisearchModule`. The service exposes an index accessor and
`addDocuments` for sync. The storefront queries Meilisearch through its own client in
`apps/ecom-store/lib/meilsearch/`. Requires `MEILI_ADMIN_API_KEY` and a reachable
Meilisearch instance.

---

## File uploads

- `MulterModule` handles multipart uploads, written to `apps/api/uploads/`.
- `ServeStaticModule` serves that directory at `/uploads`.

Note this is **local disk storage** — it does not survive a container rebuild and won't work
across multiple instances. Moving to object storage is the obvious next step if this is
deployed horizontally.

---

## Conventions

- **One feature per module.** New domain area → new folder with its own module, controller,
  service, DTOs.
- **DTOs do the validating.** `class-validator` decorators on DTO classes, not manual checks
  in controllers. `@nestjs/mapped-types` (`PartialType`) for update DTOs.
- **Config through `ConfigService`**, not `process.env`, in anything injectable. Add genuinely
  required variables to `REQUIRED_ENV_VARS` in `env.validation.ts` so they fail at boot.
- **Prisma types over hand-written interfaces.** Import enums and models from
  `@repo/database`; redefining them locally is how the two drift apart.
- **Swagger annotations** on public endpoints — the spec at `/api` is generated from them.

### Troubleshooting

**Can't reach a route / connection refused on :5000** — the process almost certainly isn't
running, or it threw during env validation. Check in that order:

```bash
netstat -ano | grep LISTENING | grep :5000    # is anything bound?
pnpm --filter api dev                         # read any boot error in full
```

**OAuth redirect mismatch** — `GOOGLE_CALLBACK_URL` / `FACEBOOK_CALLBACK_URL` must match the
redirect URI registered in the provider console _exactly_, including port and scheme.

**CORS error from the storefront** — `UFITPAL_FRONT` must match the browser's origin, and in
production the localhost fallbacks are not added.

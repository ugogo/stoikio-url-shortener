# stoikio-url-shortener

A URL shortener: exchange a long URL for a short one; following it redirects. No
accounts. Short links are **permanent** — never edited, never deleted, slugs never
reused.

Domain vocabulary: [CONTEXT.md](CONTEXT.md).

| Package              | Path                 | Stack                                                      | Port |
| -------------------- | -------------------- | ---------------------------------------------------------- | ---- |
| `@stoikio/api`       | `apps/api`           | NestJS 11 + Prisma 7 (SQLite) + Vitest                     | 3001 |
| `@stoikio/web`       | `apps/web`           | TanStack Start (React 19) + Tailwind 4 + shadcn/ui         | 3000 |
| `@stoikio/contracts` | `packages/contracts` | Zod schemas shared by api and web (the HTTP wire contract) | —    |

## Getting started

```bash
pnpm install
```

`postinstall` generates the Prisma Client. Create the database file and apply migrations:

```bash
pnpm --filter @stoikio/api db:migrate
```

Run both apps in parallel:

```bash
pnpm dev
```

Then open http://localhost:3000 and shorten something.

## Scripts

Run from the repo root; each fans out to every workspace package.

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Runs both dev servers in parallel   |
| `pnpm build`        | Builds every package                |
| `pnpm test`         | Runs every test suite (Vitest)      |
| `pnpm typecheck`    | `tsc --noEmit` in every package     |
| `pnpm lint`         | ESLint across the repo              |
| `pnpm lint:fix`     | ESLint with `--fix`                 |
| `pnpm format`       | Prettier `--write`                  |
| `pnpm format:check` | Prettier `--check` (use this in CI) |

## API

`POST /links` takes a full `http` or `https` URL — no scheme is inferred, so
`example.com` is a `400`. The body is strict, so unknown fields are rejected too:

```bash
curl -X POST http://localhost:3001/links \
  -H 'Content-Type: application/json' \
  -d '{"destination":"https://example.com/a/very/long/page"}'
```

```json
{
  "createdAt": "2026-07-30T15:42:11.902Z",
  "destination": "https://example.com/a/very/long/page",
  "slug": "aB3dEf7h"
}
```

No short URL in the response — whoever serves the link builds it from the visitor's own
origin, which the API cannot know. From `curl`, the link is `<web origin>/l/<slug>`.

Following `<web origin>/l/<slug>` costs one redirect: the web app resolves the slug
through the API server-side, then redirects straight to the destination. The API stays
the only resolver, and the redirect is a `302` rather than a `301`.

An unknown slug is a `404` from the API; visitors instead see the web app's dead-link
page — the same page a timeout or an unreachable API produces.

`GET /health` returns:

```json
{ "status": "ok", "timestamp": "2026-07-30T10:39:03.274Z", "uptime": 26.8 }
```

Tests live next to the code (`*.spec.ts`) and in `apps/api/test` (`*.e2e-spec.ts`),
and run under Vitest with `unplugin-swc` so Nest's decorator metadata is emitted. The
e2e specs write to the dev database and clean up after themselves.

### Database

Prisma 7 with SQLite. The schema lives in `apps/api/prisma/schema.prisma`; CLI
configuration (datasource URL, migrations path) lives in `apps/api/prisma.config.ts` —
Prisma 7 no longer reads the datasource URL from the schema on its own.

There is one model, `ShortLink`, keyed by its slug:

```prisma
model ShortLink {
  slug        String   @id
  destination String
  createdAt   DateTime @default(now())
}
```

No `.env`, no `dotenv`. The database path (`file:./prisma/dev.db`) is a constant in
`apps/api/src/prisma/database-url.ts`, imported by both the CLI config and
`PrismaService` so the two cannot drift. The db file and generated client are
gitignored.

| Script (from `apps/api`) | What it does                                    |
| ------------------------ | ----------------------------------------------- |
| `pnpm db:migrate`        | Creates and applies a migration (`migrate dev`) |
| `pnpm db:deploy`         | Applies pending migrations (CI/prod)            |
| `pnpm db:generate`       | Regenerates the client (also runs on `install`) |
| `pnpm db:reset`          | Drops and re-applies every migration            |
| `pnpm db:studio`         | Opens Prisma Studio                             |

Two Prisma 7 details worth knowing:

- **A driver adapter is mandatory.** `PrismaService` uses
  `@prisma/adapter-better-sqlite3`; there is no implicit connection anymore.
- **The client is generated TypeScript**, landing in `apps/api/src/generated/prisma`
  with `moduleFormat = "cjs"` (the API is CommonJS). Import from
  `../generated/prisma/client`, not `@prisma/client`, and re-run `pnpm db:generate`
  after every schema change — a fresh clone will not typecheck until you do.

`PrismaService` is provided by a `@Global()` `PrismaModule`, so feature modules can
inject it without importing anything.

## Web

File-based routing under `apps/web/src/routes`. `routeTree.gen.ts` is generated —
never edit it by hand; the Vite plugin regenerates it on dev/build, or run
`pnpm --filter @stoikio/web generate-routes`.

Two env vars, both optional in development where the defaults already line up:

| Variable       | Read by | Default                 |
| -------------- | ------- | ----------------------- |
| `VITE_API_URL` | web     | `http://localhost:3001` |
| `CORS_ORIGIN`  | api     | `http://localhost:3000` |

The API knows nothing else about the web app: it builds no short URLs and never
redirects to it.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` — there is no `tailwind.config.js`; the theme
lives in `@theme` / `:root` blocks in `apps/web/src/styles.css`.

shadcn/ui is configured in `apps/web/components.json` (style `radix-nova`, neutral base,
Lucide icons, Geist font). Add components with:

```bash
pnpm dlx shadcn@latest add <component> -c apps/web
```

They land in `apps/web/src/components/ui/` — run `pnpm lint:fix && pnpm format` after
adding one; the generated output does not match the repo's rules out of the box.

Dark mode is wired through the `.dark` class that shadcn generates, but nothing toggles
it yet; add a theme provider when you need it.

## Tooling

- **Prettier** (`.prettierrc.json`) owns formatting.
- **ESLint** (`eslint.config.mjs`, flat config) owns correctness, with:
  - `typescript-eslint` — type-checked + stylistic rules
  - `eslint-plugin-perfectionist` — natural sorting of imports, objects, types, members
  - `@eslint-react/eslint-plugin` and `eslint-plugin-react-hooks` — web only
  - `@tanstack/eslint-plugin-router` — web only
  - `eslint-config-prettier` last, so the two never fight
- **Format on save** is enabled in `.vscode/settings.json`, along with
  `source.fixAll.eslint` on save. `.vscode/extensions.json` recommends the Prettier,
  ESLint, and EditorConfig extensions — install them when prompted.

TypeScript is pinned to `6.0.3`: `typescript-eslint` declares a `<6.1.0` peer range,
so TypeScript 7 would silently drop type-aware linting.

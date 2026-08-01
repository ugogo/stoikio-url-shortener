# stoikio-url-shortener

A URL shortener: exchange a long URL for a short one. Following it redirects. No
accounts. Short links are **permanent**.

Domain vocabulary lives in [CONTEXT.md](CONTEXT.md) and the code sticks to it
(_short link_, _slug_, _destination_, _resolve_).

| Package              | Path                 | Stack                                                      | Port |
| -------------------- | -------------------- | ---------------------------------------------------------- | ---- |
| `@stoikio/api`       | `apps/api`           | NestJS 11 + Prisma 7 (SQLite) + Vitest                     | 3001 |
| `@stoikio/web`       | `apps/web`           | TanStack Start (React 19) + Tailwind 4 + shadcn/ui         | 3000 |
| `@stoikio/contracts` | `packages/contracts` | Zod schemas shared by api and web (the HTTP wire contract) | n/a  |

## Getting started

Requires **Node.js ≥ 24** (`nvm use`) and **pnpm 11** (`corepack enable`).

```bash
pnpm install
pnpm --filter @stoikio/api db:migrate
pnpm dev
```

Open http://localhost:3000 and shorten something.
<br>
Port busy? `pnpm clean` frees 3000 and 3001.
<br>
No `.env` needed. Development defaults line up out of the box.

## How it works

**Shortening.** The form posts to `POST /links`. The same Zod schema from
`@stoikio/contracts` validates on both sides: client-side for instant feedback,
server-side as the actual gate. The API stores `{slug, destination}` and returns
it. The web app builds the short URL from its own origin and shows a copy button.

**Redirecting.** `GET <web origin>/l/<slug>` is rendered server-side: it resolves
the slug through the API (`GET /links/:slug` → `302`, `Cache-Control: no-store`)
and forwards the visitor with its own `302`. Unknown slug, 5 s timeout, or
unreachable API all land on the same dead-link page, never raw JSON.

## Technical decisions

- **Shared contracts package.** One Zod schema is the source of truth for the
  wire format. Client and server cannot disagree about what a valid destination
  is, and the web app's types are inferred from the schemas the API enforces.
- **NestJS.** Modules, DI, and pipes keep a small service organized the way a
  large one would be. The `links` module could gain siblings without rearranging.
- **SQLite via Prisma.** Zero services to install, so the repo stays
  clone → install → run. Prisma makes the Postgres swap a config change,
  not a rewrite.
- **Random slugs, 8 URL-safe chars.** `randomBytes(6).toString('base64url')`.
  Roughly 280 trillion possible slugs. Random instead of sequential so links can't be enumerated and the link count can't
  be inferred.
- **The API never builds short URLs.** It returns the slug. The serving origin
  builds the URL, so the API deploys behind any domain with zero configuration.
- **`302`, not `301`.** Browsers cache `301` forever: mistakes become permanent
  and visits become uncountable. `302` + `no-store` keeps every visit observable.
- **Redirects resolved server-side in the web app.** Real HTTP redirect (no
  loading flash, works without JS) and failures become a designed page instead
  of the API's JSON `404`.

## Shortcuts taken on purpose

- **No slug-collision retry.** Today a clash would surface as a `500`. The fix is catching the unique-constraint error and retrying, not worth it at this scale.
- **No abuse controls.** Anyone can create unlimited links, and nothing screens
  where they point. The biggest gap, covered in [Security](#security).
- **No deduplication.** Same URL twice → two slugs. Intentional: dedup would
  leak that someone else already shortened a URL, and single-insert writes stay
  simple.
- **Validated, not verified.** Destinations must be `http(s)`, ≤ 2048 chars,
  and parse as a URL. `javascript:` fails closed. Whether they resolve is the
  user's business.
- **No visit analytics.** The `302`/`no-store` decision keeps the door open.
  Nothing counts visits yet.
- **No expiry.** Every link is permanent. Nullable `expiresAt` checked at
  resolve, same mechanism as the `disabledAt` in [Security](#security).

## Production path

In order:

1. **PostgreSQL.** Read-heavy workload with concurrent writers from multiple
   instances, which SQLite's single-writer model doesn't fit. With Prisma this
   is a datasource + adapter swap and regenerated migrations. Code doesn't
   change.
2. **The abuse controls in [Security](#security)**, before any public deploy.
3. **Collision retry** on slug insert.
4. **Observability.** Structured logs, request ids, metrics on the redirect
   path. `GET /health` already exists for liveness probes.
5. **Serve `/l/*` straight from the resolver.** Today every visit crosses two
   servers (web → API → back), doubling latency on the only path users feel and
   making the web tier scale with redirect traffic it doesn't need. A dedicated
   short domain pointed at the API removes the hop. The web app is only involved
   when a link is dead.

## Security

**In place.** Only `http` and `https` destinations are accepted, so a link
cannot run code in the browser. Unknown request fields are rejected and
destinations are capped at 2048 chars. Prisma parameterizes every query, so no
SQL injection. Only the web app's origin can call the API. Slugs are random, so
nobody can walk through them to find other links. Lookalike domains are
normalized on save, so a Cyrillic `аpple.com` is stored as `xn--pple-43d.com`
instead of impersonating Apple.

**Missing, worst first.** Deliberate omissions, not oversights:

1. **Anyone can create unlimited links and nothing checks where they point.**
   One script can mint ten thousand links to a fake login page from a single IP.
   Fix: rate limit per IP, screen destinations against Safe Browsing, let people
   report a link.
2. **A bad link cannot be switched off.** Links are permanent, so a malware link
   redirects forever, and deleting the row by hand would free the slug for
   reuse. Fix: a `disabledAt` column. The record stays, the redirect stops.
3. **A destination can look like a site it is not.**
   `https://paypal.com@evil.com` reads as PayPal but goes to `evil.com`.
   Fix: reject URLs carrying a username prefix.
4. **No security headers.** Nothing tells browsers to always use HTTPS for this
   domain, so a visitor's first plain `http://` request can be intercepted and
   the redirect swapped for a destination of the attacker's choosing.
   Fix: `helmet` on the API, a content security policy on the web app, HTTPS
   forced at the proxy. Config, not code.

## Testing

```bash
pnpm test
```

Vitest everywhere. Unit tests sit next to the code (`*.spec.ts`): slug
generation, destination parsing (including the `javascript:` case), health.
API e2e tests (`apps/api/test/*.e2e-spec.ts`) boot the real Nest app, cover
create → resolve → 404, and clean up after themselves.

The web app has no e2e coverage, a known gap. Next: a Playwright suite for
shorten via form, follow the link to the destination, and dead slug → error
page, which would also pin the focus and copy-button behavior units can't see.

## API

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

No scheme is inferred, so bare `example.com` is a `400`. Unknown fields are
rejected. `GET /links/:slug` → `302` or `404`. `GET /health` → status, timestamp,
uptime.

## Database

One model, keyed by its slug (`apps/api/prisma/schema.prisma`):

```prisma
model ShortLink {
  slug        String   @id
  destination String
  createdAt   DateTime @default(now())
}
```

The database path (`file:./prisma/dev.db`) is a constant in
`apps/api/src/prisma/database-url.ts`, imported by both the CLI config
(`prisma.config.ts`) and `PrismaService` so the two cannot drift. The db file
and generated client are gitignored.

| Script (from `apps/api`) | What it does                                    |
| ------------------------ | ----------------------------------------------- |
| `pnpm db:migrate`        | Creates and applies a migration (`migrate dev`) |
| `pnpm db:deploy`         | Applies pending migrations (CI/prod)            |
| `pnpm db:generate`       | Regenerates the client (also runs on `install`) |
| `pnpm db:reset`          | Drops and re-applies every migration            |
| `pnpm db:studio`         | Opens Prisma Studio                             |

Prisma 7 gotchas: a driver adapter is mandatory
(`@prisma/adapter-better-sqlite3`), and the client is generated TypeScript in
`apps/api/src/generated/prisma`. Import from `../generated/prisma/client`, not
`@prisma/client`, and re-run `pnpm db:generate` after every schema change or
nothing typechecks.

## Web

File-based routing under `apps/web/src/routes`

- `/`: the shorten form. Idle → pending → success or field-level error, focus
  managed across every transition.
- `/l/$slug`: the server-side redirect, with the dead-link page as its
  not-found state.
- `/debug`: dev-only gallery of every UI state, so each can be polished
  without contriving it.

| Variable       | Read by | Default                 |
| -------------- | ------- | ----------------------- |
| `VITE_API_URL` | web     | `http://localhost:3001` |
| `CORS_ORIGIN`  | api     | `http://localhost:3000` |

Styling: Tailwind CSS v4 (theme in `apps/web/src/styles.css`, no config file)
with shadcn/ui (`pnpm dlx shadcn@latest add <component> -c apps/web`).

## Scripts

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Both dev servers in parallel        |
| `pnpm build`        | Builds every package                |
| `pnpm test`         | Every test suite (Vitest)           |
| `pnpm typecheck`    | `tsc --noEmit` in every package     |
| `pnpm lint`         | ESLint across the repo              |
| `pnpm lint:fix`     | ESLint with `--fix`                 |
| `pnpm format`       | Prettier `--write`                  |
| `pnpm format:check` | Prettier `--check` (use this in CI) |
| `pnpm clean`        | Frees ports 3000/3001               |

Prettier owns formatting. ESLint (flat config, type-checked) owns correctness.
TypeScript is pinned to `6.0.3` because `typescript-eslint` declares a `<6.1.0`
peer range.

## AI usage

Built with Claude Code and Cursor as pair programmers: scaffolding, drafts,
review.

The prompts got the same treatment as the code. Before implementing a feature or
committing to an architecture, I ran the prompt through the `grill-me` skill:
it interrogates the intent, surfaces the blind spots and the cases I hadn't
considered, and forces the ambiguity out. What reached the agents was a
sharpened spec rather than a wish.

Nothing was merged on trust. Every generated diff was read, challenged where it
drifted from the decisions above, and tested before it landed.

QA was manual at every step: each state exercised by hand, which is exactly the
work a Playwright suite should be doing (see [Testing](#testing)). The `/debug`
route exists because of this. It made the manual pass cheap, but it is a
mitigation, not a substitute.

For UI and UX, I leaned on the `prototype` and interface skills (`better-*`, `make-interfaces-feel-better`) to explore states, focus
management, and motion. Their output was
challenged too.

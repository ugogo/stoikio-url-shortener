# stoikio-url-shortener

A pnpm monorepo.

| Package        | Path       | Stack                                              | Port |
| -------------- | ---------- | -------------------------------------------------- | ---- |
| `@stoikio/api` | `apps/api` | NestJS 11 + Vitest                                 | 3001 |
| `@stoikio/web` | `apps/web` | TanStack Start (React 19) + Tailwind 4 + shadcn/ui | 3000 |

## Getting started

```bash
pnpm install
```

Run both apps in parallel:

```bash
pnpm dev
```

Then open http://localhost:3000 — the `/` route renders "Hello world" plus the live
status of the API's `GET /health` endpoint.

## Scripts

Run from the repo root; each fans out to every workspace package.

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Runs both dev servers in parallel   |
| `pnpm build`        | Builds both apps                    |
| `pnpm test`         | Runs the API test suite (Vitest)    |
| `pnpm typecheck`    | `tsc --noEmit` in both apps         |
| `pnpm lint`         | ESLint across the repo              |
| `pnpm lint:fix`     | ESLint with `--fix`                 |
| `pnpm format`       | Prettier `--write`                  |
| `pnpm format:check` | Prettier `--check` (use this in CI) |

## API

`GET /health` returns:

```json
{ "status": "ok", "timestamp": "2026-07-30T10:39:03.274Z", "uptime": 26.8 }
```

Tests live next to the code (`*.spec.ts`) and in `apps/api/test` (`*.e2e-spec.ts`),
and run under Vitest with `unplugin-swc` so Nest's decorator metadata is emitted.

## Web

File-based routing under `apps/web/src/routes`. `routeTree.gen.ts` is generated —
never edit it by hand; the Vite plugin regenerates it on dev/build, or run
`pnpm --filter @stoikio/web generate-routes`.

The API base URL defaults to `http://localhost:3001` and can be overridden with the
`VITE_API_URL` environment variable. The API's allowed CORS origin defaults to
`http://localhost:3000` and can be overridden with `CORS_ORIGIN`.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` — there is no `tailwind.config.js`; the theme
lives in `@theme` / `:root` blocks in `apps/web/src/styles.css`.

shadcn/ui is configured in `apps/web/components.json` (style `radix-nova`, neutral base,
Lucide icons, Geist font). Add components with:

```bash
pnpm dlx shadcn@latest add <component> -c apps/web
```

They land in `apps/web/src/components/ui/` and are linted and formatted like the rest of
the codebase — run `pnpm lint:fix && pnpm format` after adding one, since the generated
output does not match the repo's ESLint and Prettier rules out of the box.

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

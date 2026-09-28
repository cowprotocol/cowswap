---
author: agents
status: normative
last_reviewed: 2026-09-28
---

# rwa-frontend AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: rwa-frontend app-specific commands only.

## App commands

- Start dev server: `pnpm start:rwa`
- Build: `pnpm build:rwa`
- Lint: `pnpx nx run rwa-frontend:lint` (runs `lint-fsd` first)
- FSD check: `pnpx nx run rwa-frontend:lint-fsd` ([steiger](https://github.com/feature-sliced/steiger))
- Test: `pnpx nx run rwa-frontend:test`
- Typecheck: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`

## Environment

- `COINGECKO_API_KEY`: CoinGecko key (server-only). Without it the keyless public API is used, which is heavily rate limited.
- `COINGECKO_API_PLAN`: `pro` for `pro-api.coingecko.com`; any other value uses the Demo API.
- `NEXT_PUBLIC_WC_PROJECT_ID`: Reown project id (defaults to the cowswap-frontend one).
- `NEXT_PUBLIC_ENABLE_SW=true`: register the service worker in dev (production always registers it).

## App rules

- `data/RWAs.json` is the asset registry. `validateRegistry.test.ts` validates it, so run the tests after editing it.
- The first token with `coingeckoId` in an asset's `tokens` is the reference for price, day range and chart. Market cap is the sum over all tokens.
- Styling uses CSS Modules (`*.module.css`) instead of `styled-components/macro`: Turbopack does not run Babel macros.
- Import `@cowprotocol/common-*` libs through side-effect-free subpaths (e.g. `@cowprotocol/common-utils/errors`). Their root entries pull Lingui macros.
- Market data must come through `entities/asset/api/assetsService.ts`. Do not call providers from routes directly.

## Architecture: Feature-Sliced Design

Follows [FSD for Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs), enforced by steiger (`steiger.config.ts`).

- `app/` (project root) is Next.js routing only. Every file re-exports from `src/_app` or `src/_pages`, including API routes (`export { getAssetsHandler as GET } from '@/_app/api-routes'`).
- `src/` layers, top to bottom: `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`. A layer imports only from layers below it. Slices on the same layer do not import each other.
- `_app` and `_pages` carry the `_` prefix so they don't clash with Next.js `app`/`pages`.
- Import other slices only through their public API (`index.ts`), e.g. `@/entities/asset`. Inside a slice, use relative imports.
- Server-only code has a separate public API, `index.server.ts` (e.g. `@/entities/asset/index.server`). Client code must not import it.
- Segments are named by purpose (`ui`, `model`, `api`, `lib`, `config`), not by kind (`components`, `hooks`, `providers`).
- Pages first: keep code in the page slice until a second consumer needs it, then extract a feature or widget. steiger's `insignificant-slice` rule flags slices with a single consumer.

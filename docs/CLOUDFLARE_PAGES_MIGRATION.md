# Cloudflare Pages Migration Notes

Scope: `apps/cowswap-frontend` and `apps/explorer` only. `cow-fi` is intentionally excluded.

## Repo-backed equivalents

### `apps/cowswap-frontend`

Vercel source of truth:
- `apps/cowswap-frontend/vercel.ts`

Cloudflare Pages equivalent:
- `apps/cowswap-frontend/public/_headers`

Captured in `_headers`:
- `Content-Security-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`

Notes:
- The Vercel redirect that sends non-asset routes to `/` is not copied into `_redirects`.
- Cloudflare Pages already provides SPA fallback for projects without a top-level `404.html`, which matches the current app output.

### `apps/explorer`

Vercel source of truth:
- `apps/explorer/vercel.json`

Cloudflare Pages equivalent:
- No repo file is required for the current rewrite behavior.

Notes:
- The Vercel rewrite from `/(.*)` to `/index.html` is intentionally not translated to `_redirects`.
- Cloudflare Pages SPA fallback covers this app as long as the build output does not introduce a top-level `404.html`.

## Cloudflare Pages UI or API settings

These settings do not have an equivalent static file in this repo for the current setup and must be configured per Pages project:
- Git repository connection
- Production branch
- Preview branch controls
- Root directory
- Build command
- Build output directory
- Environment variables
- Secrets
- Custom domains
- Branch-to-domain mappings, if used

Recommended project settings:

### `cowswap`
- Root directory: repository root
- Build command: `pnpm run install:ci && pnpm run build:cowswap`
- Build output directory: `build/cowswap`
- Build variable: `SKIP_DEPENDENCY_INSTALL=1`
- Secret: `SENTRY_AUTH_TOKEN` for build-time sourcemap upload
- Optional overrides:
  - `SENTRY_ORG=cowprotocol`
  - `SENTRY_PROJECT=frontend`
  - These are already the repo defaults and only need to be set if you want to override them.

### `explorer`
- Root directory: repository root
- Build command: `pnpm run install:ci && pnpm run build:explorer`
- Build output directory: `build/explorer`
- Build variable: `SKIP_DEPENDENCY_INSTALL=1`

## No exact Cloudflare Pages file alternative

### `cowswap` Vercel regex redirect

Current Vercel behavior:
- `source: /((?!#|.*[\\w\\d\\.-]\\.\\w{2,15}$).+)`
- `destination: /`

Why it is not translated:
- Cloudflare Pages `_redirects` does not support the same regex semantics.
- Using a broad `_redirects` rule here would be a behavior change because Pages redirect rules run before header matching and static asset resolution logic differs from the Vercel config.

Fallback used instead:
- Native Cloudflare Pages SPA serving.

## Validation checklist

- `apps/cowswap-frontend/public/_headers` is copied into `build/cowswap/_headers`.
- `build/cowswap` and `build/explorer` do not contain a top-level `404.html`.
- Deep links for both apps resolve correctly on Pages preview deployments.
- `cowswap` document responses include the migrated security headers.

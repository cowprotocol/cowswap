# Explorer solver logo preparation page

Status: complete
Owner: Codex
Created: 2026-11-11
Completed: 2026-11-12 (Europe/Lisbon)
Target PR: not requested

## Goal

Port the approved browser-local solver logo prototype into CoW Explorer at /solver-logo-tool, using Explorer's existing shell and design tokens. Keep the route outside navigation and prevent search indexing.

## Scope

- In scope: SVG/PNG upload, positioning, 10–800% zoom, crop warnings, six proposed logo contexts, original-preserving ZIP export, optional ChatGPT/Claude handoff, responsive Explorer styling, route-specific noindex metadata and response header.
- Out of scope: CMS updates, automatic AI uploads, new providers/accounts, global Explorer redesign, deployment.

## Plan

1. [x] Create isolated branch from current origin/develop and inspect Explorer conventions.
2. [x] Port the tool into typed React components and local utilities.
3. [x] Add the unlisted route and route-specific search directives.
4. [x] Verify targeted lint, tests, typecheck and rendered desktop/mobile flows.

## Decision Log

- 2026-11-11: Keep the existing two-column editor/preview workflow; inherit Explorer's dark surfaces, orange actions, typography, header and footer. Do not add a menu entry.
- 2026-11-11: Use a native lazy-loaded React page, not an iframe or separately hosted application.
- 2026-11-11: Preserve the supplied visual contexts as proposed treatments, not a claim about production.
- 2026-11-12: Complete within Explorer's incumbent visual system. Preserve global design files; the missing PRODUCT.md/DESIGN.md remain a pre-existing documentation gap. No deployment or CMS changes.

## Validation

- [x] Targeted lint: scoped ESLint clean.
- [x] Targeted tests: 29 tests across seven suites passed, including geometry, SVG safety, ZIP integrity/path safety, zoom, prompt metadata, asynchronous source handling, Helmet cleanup and server-header configuration.
- [x] Explorer typecheck: `tsc -p apps/explorer/tsconfig.app.json --noEmit` clean.
- [x] Development and production builds: `nx explorer:build:dev` and `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm exec nx run explorer:build:production --skip-nx-cache` pass. Production log: `/tmp/explorer-solver-logo-build-production.log`.
- [x] Browser upload, 800% zoom, 36px actual/72px 2× previews, offsets/background, keyboard controls, PNG warning, clipboard and safe provider links verified.
- [x] Actual PNG/SVG/AI ZIP downloads: integrity, original exact bytes, dimensions and settings verified, including SVG/AI at 70%, X 10%, Y −5%, white.
- [x] Route-only Helmet `noindex,follow` and configured Vercel headers for slash/non-slash paths verified locally; deployed response unverified.
- [x] Desktop/mobile visual checks: five valid saved local review captures cover desktop, mobile, 978px and expanded AI help on desktop/mobile; final reviewer disposition **ship**, with no material fixes. Evidence preserved outside the repo at `/Users/mb/Documents/ChatGPT/COW/outputs/solver-logo-tool-explorer-2026-11-12`.
- [x] Added concise module README covering behaviour, provenance, local processing, manual AI handoff, limits and verification.

## Follow-ups

- Publishing or CMS integration requires a separate request.

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
- Lint: `pnpx nx run rwa-frontend:lint`
- Test: `pnpx nx run rwa-frontend:test`
- Typecheck: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`

---
author: agents
status: normative
last_reviewed: 2026-06-19
source_of_truth_scope: cowswap-frontend Safe API client token handling
---

# Safe API Client Token

`REACT_APP_SAFE_API_AUTH_TOKEN` is intentionally consumed by browser code for Safe API reliability and rate-limit behavior.

Treat this value as a public client token, not as a private server-side secret. Do not remove it or flag it solely because it is browser-exposed.

Replacing this token requires an approved product or architecture change, such as routing Safe API traffic through a backend proxy. Any replacement must preserve Safe wallet and TWAP behavior, including unauthenticated fallback behavior where it exists.

Known client-side consumers:

- `@cowprotocol/core` Safe API helpers create Safe API Kit clients with this token when available.
- `cowswap-frontend` TWAP Safe transaction history requests send this token as a bearer token when available, and fall back to unauthenticated requests when it is absent.

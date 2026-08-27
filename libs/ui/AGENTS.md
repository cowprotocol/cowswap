---
author: agents
status: normative
last_reviewed: 2026-08-27
source_of_truth_scope: shared UI library typography tokens and font mixin
---

# ui AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: additive typography rules for `@cowprotocol/ui`.

## Typography
- `SHOULD` apply size, line-height, and weight with `font()` from `src/utils/font.ts` in styled-components, not `Font` constants in component CSS.
- `fontFamilyBrand` is a cowswap-frontend-only exception. `MUST NOT` apply it to shared `libs/ui` components.
- New sizes `MUST` be shared tokens: `FONT_SIZING` (size + line-height) in `src/consts.ts`, `UI.FONT_SIZE_*` in `src/enum.ts`, and the CSS variable in `ThemeColorVars`. `MUST NOT` add a step 1px from an existing one (especially ≥16px) or a one-off used in a single component.
- Details: [`docs/MODULE_CONVENTIONS.md`](../../docs/MODULE_CONVENTIONS.md) (Typography). Do not migrate existing call sites unless the task already touches that style.

---
author: agents
status: normative
last_reviewed: 2026-08-27
source_of_truth_scope: naming, file structure, exports/imports, React module hygiene, and typography tokens
---

# Module Conventions

## Naming and File Shape

- Prefer explicit suffixes:
  - `*.container.tsx`, `*.pure.tsx`, `*.styled.ts`, `*.types.ts`, `*.constants.ts`, `*.utils.ts`, `*.service.ts`, `*.test.ts`
- Hooks are the naming exception and should use `useX.ts` / `useX.tsx`.
- Avoid generic filenames like `styled` unless the file is intentionally a barrel or module entry.

## Exports

- Prefer named exports over default exports.
- Keep component file exports focused (component + component-specific types).
- Re-export public module APIs from `index.ts`.

## Imports

- Within a module, use relative imports for module internals.
- For shared app code, use aliases (`common/...`, `modules/...`) instead of long relative traversals.
- Avoid deep internal imports across module boundaries unless explicitly justified.
- Follow repository `import/order` lint rules.

## React Authoring Rules

- Do not define components inside render bodies.
- Avoid helper factories that return JSX on hot render paths.
- Keep stable list keys; do not generate random keys per render.
- Prefer extraction/composition over pass-through wrapper components.

## Localization

- Keep Lingui `t\`\`` / `t()` calls inside components or functions.
- Do not place translation calls at module scope.

## Styling

- Use `styled-components/macro` (not raw `styled-components`).
- Keep style-only files in `*.styled.ts` when styles are non-trivial.
- In cowswap-frontend modules, style imports should use:
  ```ts
  import * as styledEl from './X.styled'
  ```

## Typography (CoW Swap + `libs/ui`)

Applies to new or edited styles in `libs/ui` and `apps/cowswap-frontend`. Explorer and cow-fi use their own rem-based scales; still do not invent 1px-off one-off sizes there.

- `SHOULD` set size, line-height, and weight with the `font()` mixin from `@cowprotocol/ui` (a styled-components mixin, not a `font:` shorthand):
  ```ts
  import { font } from '@cowprotocol/ui'

  const Title = styled.h3`
    ${font('FONT_LARGE', 'semibold')}
  `
  ```
- `SHOULD NOT` use `Font` from `@cowprotocol/ui` in component styles. `Font.family*` is for theme and `:root` assignment; `Font.weight*` is for deriving CSS variables. In components, pass a weight name to `font()` (`'medium'`, `'semibold'`).
- `SHOULD` use CSS variables for family (`var(${UI.FONT_FAMILY_PRIMARY})`). `SHOULD` use `var(${UI.FONT_SIZE_*})` / `var(${UI.FONT_WEIGHT_*})` only when the mixin cannot be used (inline styles, non-styled-components).
- `fontFamilyBrand` is a cowswap-frontend-only exception for a few Studio Feixen brand spots (order tracker, surplus modal). `MUST NOT` use it in `libs/ui`, Explorer, cow-fi, or new shared surfaces.
- `MUST NOT` add a one-off `font-size` (or a new token) that is 1px away from an existing step, especially at 16px and above. Prefer the nearest existing token (for example 19px → `FONT_LARGE` / 18px).
- If a genuine new size is required, add it as a shared token, not a local px value: extend `FONT_SIZING` in `libs/ui/src/consts.ts` (size + line-height pair), the matching `UI.FONT_SIZE_*` enum, and `ThemeColorVars`. Keep the scale small; a one-off size used in a single component is a red flag.
- Do not drive-by-migrate existing `Font.*` or raw `font-size` usages unless the task already touches that style.

## TypeScript Rules

- `strictNullChecks` assumptions apply.
- Never use `any` for production code; prefer specific types or `unknown`.
- No non-null assertions (`!`).
- Use enums/unions from upstream SDK/types instead of raw string literals.

---
author: agents
status: normative
last_reviewed: 2026-03-05
source_of_truth_scope: naming, file structure, exports/imports, and React module hygiene
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

## TypeScript Rules

- `strictNullChecks` assumptions apply.
- Never use `any` for production code; prefer specific types or `unknown`.
- No non-null assertions (`!`).
- Use enums/unions from upstream SDK/types instead of raw string literals.

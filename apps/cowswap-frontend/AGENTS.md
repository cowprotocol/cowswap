# cowswap-frontend AGENTS.md

This file is additive. Follow the repo root `AGENTS.md` for full rules.

## App commands
- Start dev server: `pnpm start` or `pnpm start:cowswap`
- Build: `pnpm build:cowswap`
- Preview: `pnpm preview`
- Lint: `pnpx nx run cowswap-frontend:lint`
- Test: `pnpx nx run cowswap-frontend:test`
- i18n (app-only): `pnpx nx run cowswap-frontend:i18n`
- Cosmos: `pnpm start:cosmos`

## Architecture principles
- Apply Dependency Inversion Principle: higher-level modules should depend on abstractions, not concrete low-level details.
- Abstractions should not depend on details; concrete details should depend on abstractions.
- If code is shared by two or more apps, move it to `libs/`; if it is used by one app only, keep it in that app.

## Module structure and boundaries
- Organize domain code by module under `src/modules/<domain>/`.
- Typical module entities:
  - `containers/` (smart components)
  - `pure/` (presentational components)
  - `hooks/`
  - `state/` (Jotai atoms)
  - `updaters/` (legacy/internal pattern to avoid duplicate execution; see state notes below)
  - `index.ts` (module entry for public exports)
- Treat `src/common` as a shared module namespace; do not put domain-specific logic there.
- Before adding code to `src/common`, verify it is truly cross-domain/shared and not owned by a specific module.
- `src/common` should follow module-like structure too (`containers/`, `pure/`, `hooks/`, `state/`) when applicable.
- Default to directory-per-entity instead of loose files directly inside entity folders; tightly coupled nesting is acceptable.
- Modules may include additional directories (`utils/`, `constants/`, `types/`) when needed.

## File naming and exports
- Prefer explicit suffixes: `*.container.tsx`, `*.pure.tsx`, `*.modal.tsx`, `*.input.tsx`, `*.updater.tsx`, `*.styled.ts`, `*.atoms.ts`, `*.types.ts`, `*.constants.ts`, `*.utils.ts`, `*.service.ts`, `*.test.ts`.
- Non-barrel files should use an explicit approved suffix; hooks remain the naming exception.
- Hooks are the naming exception: use descriptive `useX.ts`/`useX.tsx` filenames.
- Avoid generic filenames like `styled` or `index` unless the file is an actual barrel export.
- Avoid generic type names like `Props`/`Options`; use specific names (for example, `TradeWidgetContainerProps`).
- Use named exports only (no default exports).
- In component files, export only components and their interfaces to preserve React Fast Refresh behavior.
- Simple components can keep very small styling/type definitions in the same file; split only when complexity grows.
- Suffix guidance is pragmatic: small mixed-category files are acceptable when tightly related, but large type/style blocks should be split out.

## File contents and typing
- Use explicit return types where they improve safety/readability. Keep local trivial internals inferred; keep exported APIs aligned with root `AGENTS.md` requirements.
- Prefer `as const`, `satisfies`, and `as const satisfies` where they improve literal safety.
- Prefer `unknown` to `any`.

## Import rules
- Inside a module, import module internals relatively.
- Shared code must be imported from root aliases (for example `common/...`), not via long relative traversals.
- Public module API must be re-exported via the module `index.ts`.
- Imports from another module must go through that module's `index.ts` barrel (for example `modules/trade`), not deep internal paths.
- Keep module hierarchy acyclic: once a generic module is used by another module, it must not depend back on that module.
- Barrel imports have performance and circular-dependency tradeoffs: keep barrels narrow and re-check dependency direction before adding exports.

## Module hierarchy guidance
- Main trade-widget modules include `swap`, `limitOrders`, `twap`, `yield`, and `hooks`; keep their boundaries aligned with the existing trade-widget architecture.
- Treat widget-specific modules (for example `swap`, `limitOrders`, `twap`) as high-level/dead-end modules: they may depend on generic modules, but generic modules must not depend on them.
- Treat shared domains (for example `trade`, `usdAmount`) as generic modules and keep them independent of consumer widgets.
- If a generic module needs a widget-owned implementation detail, extract that detail into a new lower-level shared module and import it from both sides.

## Frontend module hygiene
- `index.tsx` should be entry/export only where possible.
- Put component logic in `*.container.tsx`.
- Put styles in `*.styled.ts`.
- Import styles as `import * as styledEl from './X.styled'`.

## State management notes
- Prefer managing side effects with `jotai-effect` rather than updaters.
- Use `atom.onMount` to subscribe to external sources when needed.
- Prefer `jotai/query` (`atomWithQuery`) over `useSWR`.

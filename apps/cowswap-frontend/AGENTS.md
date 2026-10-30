---
author: agents
status: normative
last_reviewed: 2026-10-30
source_of_truth_scope: cowswap-frontend-specific architecture and module overrides
---

# cowswap-frontend AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).

## App commands
- Start dev server: `pnpm start` or `pnpm start:cowswap`
- Build: `pnpm build:cowswap`
- Preview: `pnpm preview`
- Lint: `pnpx nx run cowswap-frontend:lint`
- Test: `pnpx nx run cowswap-frontend:test`
- Single test file: `pnpm exec jest --config apps/cowswap-frontend/jest.config.ts --runTestsByPath apps/cowswap-frontend/src/path/to/file.test.ts --runInBand`
- i18n (app-only): `pnpx nx run cowswap-frontend:i18n`
- Cosmos: `pnpm start:cosmos`

## Localization catalogs

- `src/locales/en-US.po` is the source catalog and MUST be updated through the i18n extraction command, not manually.
- Non-source `src/locales/*.po` catalogs are managed by Crowdin and MUST NOT be edited in feature or fix PRs; manual changes will be overwritten.
- Submit translation additions or corrections through Crowdin or the localization maintainers. See the [localization guide](./src/lib/README-LOCALIZATION.md).

## Architecture principles
- Apply Dependency Inversion Principle: higher-level modules should depend on abstractions, not concrete low-level details.
- Abstractions should not depend on details; concrete details should depend on abstractions.
- If code is shared by two or more apps, move it to `libs/`; if it is used by one app only, keep it in that app.

## Security notes
- Safe API client token handling is documented in [`docs/safe-api-token.md`](./docs/safe-api-token.md). Treat `REACT_APP_SAFE_API_AUTH_TOKEN` as an intentional public client token unless that document changes.

## Module structure and boundaries
- Organize domain code by module under `src/modules/<domain>/`.
- Typical module entities:
  - `containers/` (smart components)
  - `pure/` (presentational components)
  - `hooks/`
  - `state/` (Jotai atoms)
  - `updaters/` (legacy; a new side effect uses `observe` from `jotai-effect` in `state/`. See state notes below)
  - `index.ts` (module entry for public exports)
- Treat `src/common` as a shared module namespace; do not put domain-specific logic there.
- Before adding code to `src/common`, verify it is truly cross-domain/shared and not owned by a specific module.
- `src/common` should follow module-like structure too (`containers/`, `pure/`, `hooks/`, `state/`) when applicable.
- Default to directory-per-entity instead of loose files directly inside entity folders; tightly coupled nesting is acceptable.
- Modules may include additional directories (`utils/`, `constants/`, `types/`) when needed.

## File naming and exports
- Prefer explicit suffixes: `*.container.tsx`, `*.pure.tsx`, `*.modal.tsx`, `*.input.tsx`, `*.updater.tsx` (legacy; do not add new updater files), `*.styled.ts`, `*.atoms.ts`, `*.types.ts`, `*.constants.ts`, `*.utils.ts`, `*.service.ts`, `*.test.ts`.
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

## Typography
- `SHOULD` use the `font()` mixin from `@cowprotocol/ui` for size, line-height, and weight in styled-components (`${font('FONT_NORMAL', 'semibold')}`), not `Font.weight` / `Font.family*` and not one-off `font-size` px values.
- `SHOULD` use `var(${UI.FONT_FAMILY_PRIMARY})` (Inter) for family; use `var(${UI.FONT_SIZE_*})` only when the mixin cannot be used. Studio Feixen Sans (`fontFamilyBrand`) is an allowlisted brand exception only — exact component list in [`docs/FONT_CONVENTIONS.md`](../../docs/FONT_CONVENTIONS.md). Feixen Mono is removed; do not reintroduce it.
- `MUST NOT` introduce a size 1px off an existing token (especially ≥16px) or a one-off size used in a single component. Add a real new step only via `FONT_SIZING` + `UI.FONT_SIZE_*` + `ThemeColorVars`.
- Full rule: [`docs/FONT_CONVENTIONS.md`](../../docs/FONT_CONVENTIONS.md). Do not migrate existing `Font.*` / raw sizes unless already editing that style.

## State management notes
- `SHOULD` run side effects with `observe` from `jotai-effect` in `state/`. `SHOULD NOT` add an updater so a `useEffect` can write atoms after render.
- Use `atom.onMount` to subscribe to an external source while the atom has listeners.
- `SHOULD` wait for a deadline with `setTimeout`. `runCountdown` in `@cowprotocol/common-hooks` wakes when the whole second changes and stops at zero. `useRemainingSeconds` re-renders on that change. `useCountdown` writes text without a render when the value is only displayed.
- `SHOULD NOT` poll a known deadline with `setInterval`.
- Both SWR and `jotai/query` (`atomWithQuery`) are acceptable for data fetching; the team is evaluating migration.

## Business logic and unit tests
- `MUST` keep derivations and state transitions in `state/` (Jotai atoms) or in pure `utils/` / `services/` functions. Components call `useAtomValue`, `useSetAtom`, or `useAtom` on the atom.
- `MUST NOT` add a hook whose body only returns `useAtomValue(someAtom)`, `useSetAtom(someAtom)`, or `useAtom(someAtom)`. Call the Jotai hook at the component. 
- `MUST NOT` chain domain hooks inside `useMemo` / `useCallback` / `useEffect` / `useLayoutEffect` to compute domain state. Extract a derived or write atom.
- `MUST NOT` import `react`, `react-redux`, or `legacy/state` from new files under `state/` or `utils/`. ESLint blocks this. Existing files are an allowlist in `eslint.config.js`.
- `SHOULD` test atoms and pure functions in `*.test.ts` with `createStore()` from `jotai`.
- `SHOULD NOT` add `render` / `renderHook` tests, or stack `jest.mock()` calls, unless the subject is a complex stateful container or a browser-only hook and the PR notes say why. More than 3 `jest.mock()` calls together with `render` / `renderHook` fails `pnpm arch:check` when the file is new or the mock count grew.
- UI behavior belongs in Cosmos fixtures and Playwright (`apps/cowswap-e2e-tests`), not in unit tests that restate markup.

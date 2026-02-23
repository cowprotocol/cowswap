# CoW Protocol Development Guidelines (AGENTS.md)

This file applies to the whole monorepo. If a closer AGENTS.md exists under an app or package, follow it first and also follow this root file unless it explicitly says it fully replaces it.

## Setup commands (monorepo)
- Install deps: `pnpm install`
- Generate i18n: `pnpm i18n`
- Start apps:
  - `pnpm start` (cowswap-frontend)
  - `pnpm start:cowswap`
  - `pnpm start:explorer`
  - `pnpm start:widget`
  - `pnpm start:cowfi`
  - `pnpm start:sdk-tools`
  - `pnpm start:omnibridge-hook`
  - `pnpm start:cosmos` (cowswap-frontend Cosmos)
  - `pnpm start:cosmos:explorer` (explorer Cosmos)
- Lint and test: `pnpm lint`, `pnpm test`
- Per-project Nx targets: `pnpx nx run <project>:<target>` (targets include serve, build, lint, test, e2e)

## Repo layout
- apps/ - applications
- libs/ - shared libraries
- tools/ - build/dev tooling
- testing/ - integration test helpers

Legacy structure notes:
- apps/cowswap-frontend: common/ is leaf-only and must not import from modules/.

## Architecture direction: Feature-Sliced Design (FSD)
We are moving toward FSD for frontend apps. Adopt incrementally.

- Layers (top to bottom): app, pages, widgets, features, entities, shared.
- Use slices for domains and segments for purpose (ui, model, api, lib, config).
- Imports may only point to the same or lower layer.
- New work should follow FSD where feasible; avoid large refactors unless required.

---

## Table of Contents

1. [Quick Review Priorities](#quick-review-priorities)
2. [PR Workflow & Release Process](#pr-workflow--release-process)
3. [Architecture & Module Boundaries](#architecture--module-boundaries)
4. [TypeScript & Typing Standards](#typescript--typing-standards)
5. [React & UI Implementation](#react--ui-implementation)
6. [Async, Data & Performance](#async-data--performance)
7. [Domain Conventions & Utilities](#domain-conventions--utilities)
8. [Quality Gates & Testing](#quality-gates--testing)
9. [Implementation Research & Debugging](#implementation-research--debugging)
10. [Reference Materials](#reference-materials)

---

## Quick Review Priorities

- **Red Flags - STOP if creating:**
  - Ref-based caches for "stability" -> inspect the root cause of instability first.
  - Complex bespoke state managers -> investigate the trigger chain instead of layering abstractions.
  - Complicated JS logic to prevent visual glitches -> prioritize CSS-based solutions first.
  - Hook dependency cascades -> verify control flow before tweaking dependency arrays.
  - Hardcoded environment-specific lists/toggles when shared config/enums exist.
  - Shipping `eslint-disable` or "TODO add return type" scaffolding instead of providing explicit types.
  - Inline render factories used to dodge `react/no-unstable-nested-components` warnings.
  - Magic zero-address placeholders when a sentinel constant (e.g. `BRIDGE_QUOTE_ACCOUNT`) is available.
- **Console usage:** `console.log/info/debug` must be intentional, namespaced, and low-volume. Otherwise route through the centralized logger.
- **Amount displays:** Whenever a `TokenAmountDisplay` exists, pair token amounts with USD values using `useUsdAmount` or cached fiat values.

---

## PR Workflow & Release Process

- **Development commands:** Never run `pnpm lint --fix`; use `pnpm lint` only. Follow the command catalogue documented in the repository README and `package.json` scripts.
- **Pull request requirements:**

  | Rule          | Requirement                                    |
  | ------------- | ---------------------------------------------- |
  | Target branch | develop                                        |
  | PR size       | <= 400 LOC; chain sequential PRs for larger work |
  | Commit style  | Conventional Commits; PR title == squash message |
  | Approvals     | Two reviewers (frontend + QA)                  |
  | Ownership     | Self-assign, tag reviewers, <= 3 open PRs      |
  | CI            | All checks must pass                           |
  | Merge         | Squash-merge to develop                        |

- **Release automation:** Confirm release-please/deployment status before raising manual hotfix/retry PRs. Close duplicates once automation succeeds.

### Branch-scoped AGENTS enforcement (AI task protocol)

- Use this protocol when asked to "apply/fix AGENTS.md rules in this branch."
- **Mandatory context loading:**
  - Read root `AGENTS.md`.
  - Read the nearest additive `AGENTS.md` for each touched file (especially `apps/cowswap-frontend/AGENTS.md` when applicable).
- **Scope constraints:**
  - Default to changing only files already touched in the current branch versus `develop`.
  - Allow minimal additional files only when required for correctness (type safety, imports/exports, runtime behavior, or tests).
  - Every additional file must be explicitly listed in the final report with a one-line justification.
  - Keep diff surface minimal.
  - Do not edit unrelated files.
- **Required process:**
  1. Compute touched files with:
     ```bash
     git diff --name-only $(git merge-base HEAD develop)..HEAD
     ```
  2. Audit only those files for AGENTS.md violations.
  3. Fix violations directly.
  4. Keep architecture/import boundaries correct (prefer module barrel imports; avoid forbidden/internal patterns).
  5. Follow TypeScript/React rules (no `any`, no non-null assertions, no unstable nested components, explicit safe typing).
  6. Follow frontend module hygiene:
     - `index.tsx` should be entry/export only when possible.
     - Put component logic in `*.container.tsx`.
     - Put styles in `*.styled.ts`.
     - Import styles as:
       ```ts
       import * as styledEl from './X.styled'
       ```
  7. Reuse existing utilities/hooks instead of creating new ones.
  8. Run verification:
     - File-level eslint for changed files.
     - Targeted tests for affected area.
     - Do not run `pnpm lint --fix`.
- **Command toolkit (recommended):**
  - Compute touched files:
    ```bash
    git diff --name-only $(git merge-base HEAD develop)..HEAD
    ```
  - Collect lintable touched files (`.ts/.tsx/.js/.jsx`) and lint only those.
  - Run targeted tests nearest to the changed feature/module (project target or test path scoped command).
  - If a command is skipped, report why (for example, missing target or environment limitation).
- **Response format for this task:**
  1. Findings first (severity ordered), each with `file:line`.
  2. Exact fixes made, with file references.
  3. Additional files changed beyond touched set (if any), each with justification.
  4. Commands run and pass/fail result.
  5. Residual risks/testing gaps (if any).

---

## Architecture & Module Boundaries

- **Monorepo layout:** `apps/`, `libs/`, `tools/`, `testing/`.
- **cowswap-frontend structure:** `common/` (leaf-only, no deps on `modules/`), `modules/`, `pages/`, `api/`, `types/`.
- **Data-driven configuration:** Extend shared constants/enums instead of hardcoding environment-specific lists or toggles.
- **Bridge UX language:** Use shared constants when referencing protocol names or disclaimers to keep copy consistent.
- **Isolate state ownership:** Keep mutable agent or UI state scoped to the module that mutates it. Avoid global bags that force unrelated consumers to recompute when one slice changes - split state into focused stores and wire only the owners who actually read it.

### Front-end hygiene (reviewer hot buttons)

- Shared hooks belong under a `hooks/` directory, not inside components.
- Prefer existing helpers (e.g., `withTimeout`/`fetchWithTimeout` from `@cowprotocol/common-utils`) over local copies; avoid aliasing unless names collide.
- Export static configs as `const` instead of factory functions.
- Use `.const.ts` suffixes for files that only define constants/configs (component/model/etc.) for readability.
- Reuse chain/network lists from shared constants (`AFFILIATE_SUPPORTED_CHAIN_IDS`, etc.) rather than cloning arrays.
- Lingui: import macros from `@lingui/core/macro` and drop unused imports immediately.
- UI components like `LinkStyledButton` come from `@cowprotocol/ui` (not `theme`).

---

## TypeScript & Typing Standards

### Core rules

- `strictNullChecks` everywhere - type everything explicitly.
- **NEVER** use `any`; prefer `unknown` or stronger types.
- **NO** non-null assertions (`!`). Guard inputs and return early.
- Always use optional chaining (`?.`) and explicit return types for exports.
- When upstream packages expose enums or typed unions (e.g., `CompetitionOrderStatus.type`, `OrderClass`), depend on those tokens instead of hardcoded string literals. Reviewers flag "magic" status strings every time.
- Keep defaults for optional boolean props.
- Keep TypeScript/TSX sources around 200 LOC; anything over 200 needs active justification, and non-generated files must stay <= 250 LOC.
- Prefer shared domain aliases such as `Nullish<T>`, `StatefulValue<T>`, address helpers, `areAddressesEqual`, `clampValue`, etc.
- Remove linter scaffolding (`// TODO`, `eslint-disable`) by supplying the correct types before shipping.
- Use `enum + Record<Enum, T>` for exhaustive mappings.
- When registering event handlers or callbacks, type the parameters explicitly (e.g. `handler: (payload: OnFulfilledOrderPayload) => { ... }`) instead of casting inside the body; rely on TypeScript inference rather than `payload as ...` when the upstream emitter already exposes the payload type.

### Null safety & state patterns

- Validate inputs in helpers; offer `NonNullable<T>` only once verified by callers.
- Use keyed objects/maps for multi-entity state (`atom<Record<string, T>>({})`), with lowercase keys (`toLowerCase()`), and reset on network/account changes.

### Enum hygiene

- Replace manual arrays with `Object.values(Enum)`.
- Search for patterns like `[EnumName.VALUE1, EnumName.VALUE2` to eliminate manual lists.

### Interface & prop safety

- Remove unused params immediately (verify via `rg` first).
- Keep interfaces minimal - no Swiss-army props; no optional params when a value is required (`value: T | undefined` instead of `value?: T`).
- Double-check casts, especially across chains and bridge flows.
- Use `!!value` for explicit boolean conversions.
- Hoist repeating strings/tooltips into constants colocated with the feature.

---

## React & UI Implementation

### Component authoring

- **Render/helper antipattern:** Never declare components inside render bodies or rely on `render*`/`get*` helpers that return JSX. Hoist subcomponents to module scope, or convert them into proper components so every render cycle reuses the same identity.
- Export named function components and return `ReactNode`.
- Pure components can use only the following hooks:
  - built-in hooks (e.g. `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`)
  - hooks which provide the state of the current module (e.g. `useOrdersTableState()` can be used in pure components of `modules/ordersTable`)
  - common state providing hooks (e.g. `useTheme()`)
  Hoist any other dependencies or data loaders into callers and pass results via props instead.
- Decompose large components into `modules/<feature>/pure/` pieces; prefer composition over configuration enums.
- Avoid wrapper components that pass props through without logic.
- Replace inline factories with extracted components or memoized callbacks; obey `react/no-unstable-nested-components`.
- Memoize render-prop wrappers (e.g., accordion `feeWrapper`) with `useCallback` for referential stability.

### Render stability rules

- **Define once, reuse always (MUST):** Keep component/helper creation out of render/execution loops. If a helper needs data, pass it in via props/params instead of redefining it each cycle.
- **Stable references (MUST):** Avoid inline component creation in returns or array operations unless memoized. Prefer extracted components or memoized factories so React can rely on referential equality.
- **Separation of phases (SHOULD):** Initialize expensive objects once (module scope or `useMemo`), and update via state/props instead of changing object identity.
- **Cache or memoize dynamic creations (SHOULD):** When dynamic instantiation is unavoidable, cache by a stable key so identical inputs reuse the same instance.
- **List identity (MUST):** Supply stable keys/IDs. Never generate random keys per render, and only fall back to indices when the order is static.
- **No hot-path factories (MUST):** Do not instantiate classes/services inside `.map`/loop bodies. Hoist creation to module scope or memoize via a cache keyed by stable identifiers.
- **Document exceptions (MUST):** Any unavoidable nested helper must come with a comment and PR justification.

### Rendering patterns

- Avoid inline IIFEs/closures inside `.map()`; extract helpers outside render.
- Use slot-style props (`beforeContent`, `afterContent`) over render props when possible.
- Filter optional list entries (e.g., `contents.filter(isTruthy)`) before mapping to JSX.
- Return `null` for intentionally empty React nodes; avoid relying on `undefined`.
- Use `TokenAmountDisplay` and include USD amounts when available.

### Shared contexts & selectors

- Utilize Jotai for state memoization and slicing. Prefer using Jotai tools instead of React hooks for state manipulations (memoization, slicing, etc.).
- Split large context providers or shared stores into focused slices. Consumers should only subscribe to the slice they need so unrelated updates do not cascade through the tree.
- Memoize provider values - wrap object literals, callbacks, or service references in `useMemo`/`useCallback` so referential stability prevents unnecessary reruns downstream.
- Prefer selector/filtered subscription APIs (e.g., `useSwapContext(selector)`) instead of broadcasting whole context payloads to every consumer.

### Styling & imports

- Satisfy the `import/order` eslint rule. The config of the rule is defined in the root `eslint.config.js`.
- Forbidden imports: raw `styled-components` (use the macro), package `dist/`, router's `useNavigate`.
- Styled components: optional booleans defaulted, props typed, and meaningful wrappers only.

### Fixture hygiene

- Keep `.cosmos.tsx`, Storybook stories, and snapshots updated whenever props/types change to avoid stale demos.

---

## Async, Data & Performance

### Memoization & complexity

- Hooks returning objects must use `useMemo`.
- `useCallback` only when reference equality matters; `React.memo` for stable presentational pieces.
- Build stable dependency keys first (serialize arrays) before passing to effects/memos.
- Derive primitive memo deps (e.g., balance strings, amount hashes) instead of spreading whole objects/arrays into dependency lists.
- Skip redundant clones - reuse existing immutable arrays or objects.
- Measure before optimizing - profile first, then apply memoization where the data proves it helps.
- Function complexity <= 15 cyclomatic; length <= 80 lines - extract helpers instead of disabling rules.
- Only memoize heavyweight calculations or objects that are passed around frequently; avoid wrapping trivial logic in `useMemo`/`useCallback` just to silence lints.
- Treat heavy reasoning modules as pure: if the output depends solely on inputs, implement them without side effects so they can be memoized or cached reliably. Ensure the inputs themselves remain stable so equality checks succeed.

### Async flow discipline

- Guard polling/loops with in-flight flags; never let overlapping requests write to state.
- Update derived state incrementally as each page resolves; no batching at the end.
- Cancel or skip follow-up work if a previous request is still running.
- Drive feature toggles from real data comparisons (e.g., compare chain IDs to determine bridging) instead of heuristics.
- Route SDK lifecycle hooks (e.g., `SigningStepManager`) through shared entities to keep UI indicators (steppers, banners) in sync.

### Data fetching & caching

- **SWR is deprecated.** New data fetching must use Jotai `atomWithQuery` (jotai/query). See [atomWithQuery usage][jotai-atomWithQuery].
- When touching an existing SWR-backed flow, migrate it to `atomWithQuery` unless there is a documented blocker.
- If a temporary SWR usage is unavoidable, keep to these legacy rules:
  - SWR keys must include every parameter affecting the response (chain IDs, addresses, accounts, quote IDs, etc.).
  - Memoize parameter objects passed to SWR.
  - Use `SWR_NO_REFRESH_OPTIONS` when revalidation would cause flicker.
- Surface remote data through shared hooks (`useBridgeOrderQuote`, `useSwapAndBridgeContext`, etc.) instead of prop-drilling.
- Store normalized response shapes under `common/types/<domain>.ts`.
- Cache long-lived responses (quotes, solver data) and rehydrate via hooks instead of re-fetching.
- Reuse SDK parameter types (`BuyTokensParams`) rather than ad-hoc bags.
- Detect whether data originated locally or from the API and adapt derived values (e.g., bridge output tokens).
- Deduplicate merged datasets (e.g., pending activities + bridge orders) before counting or rendering.
- Handle provider quirks gracefully - fallback to cached data when remote results are incomplete (e.g., ETH vs WETH).
- Use domain sentinel constants (`BRIDGE_QUOTE_ACCOUNT`) instead of magic zero addresses.

[jotai-atomWithQuery]: https://jotai.org/docs/extensions/query#atomwithquery-usage

### Entities & shared state

- **Use jotai atoms for entity state management:** For entities that require state management, use jotai atoms as the default pattern. For entities requiring persistence, use `atomWithStorage` following the `bridgeOrdersAtom` pattern (store atom + derived atom for serialization).
- **Do not use manual localStorage:** Avoid `useState` + `useEffect` with manual `localStorage.getItem/setItem` for entity state. Use `atomWithStorage` instead.
- Reference implementations:
  - `apps/cowswap-frontend/src/entities/bridgeOrders/state/bridgeOrdersAtom.ts`
  - `libs/tokens/src/state/tokens/favoriteTokensAtom.ts`
  - `apps/cowswap-frontend/src/modules/tokensList/state/recentTokensAtom.ts`
- Co-locate cross-feature atoms/hooks under `entities/<domain>/` and re-export via `index.ts`.
- Provide reset hooks alongside setters so screens can clean up on navigation/unmount.
- Persist bridge order metadata (quotes, recipients, timestamps) so progress UIs survive reloads.

---

## Domain Conventions & Utilities

### Analytics & telemetry

- New payload keys use camelCase.
- Do not introduce snake_case duplicates except at ingestion/provider layers with explicit aliasing.
- Ensure analytics recompute when source data (quotes, chains, amounts) changes.
- Bridge analytics events should include token address and human metadata (symbol/decimals) so downstream dashboards stay consistent.

### Persistence keys

- LocalStorage/IndexedDB keys must follow `camelCaseBase:v{number}`; start new keys at `:v0` and bump the version when the stored shape changes.
- Avoid underscores/dashes in key bases so app-wide key scans stay consistent.

### Utility reuse

- Search the repo before adding new utilities; reuse when possible.
- If adding a new shared util, justify it in the PR description.

### State migrations

- Place migrations under `state/migrations/*` within the owning module.
- Invoke migrations at module entry before exports.
- Parse persisted state defensively; never throw on malformed data.
- Tag migrations with a removal `// TODO` date for cleanup.

### Logging & diagnostics

- Replace stray `console.log/debug/info` with the centralized logger unless intentionally scoped diagnostics (prefixed) are required.

---

## Quality Gates & Testing

### Testing expectations

- Ship unit and/or integration coverage for every new feature and bug fix. If a scenario is genuinely un-testable, call it out in the PR description and explain why.
- New state handlers (atoms, stores, controllers/updaters, reducers) always ship with targeted specs that exercise their state transitions. Reviewers routinely block on this when missing.
- Add additional Jest logic specs or Storybook/Cosmos visual checks as the behaviour demands.
- Run full CI locally when possible; always test your own PRs.

### Dependency management

- For dependency bumps, link upstream release notes, document breaking changes, and supply targeted smoke tests to prove compatibility.

### Code quality fundamentals

- Prefer small, focused functions adhering to project structure and lint formatting.
- Question every abstraction; avoid unnecessary wrapper layers.
- Extract helper components when files accumulate more than 2-3 helpers.
- Never reassign via `let`; favour `const` and ternaries/early returns.
- No side effects in render - use `useEffect`, `useCallback`, or event handlers instead.

### Pre-commit inspection

- **Code smell detection:**
  - `rg "=== ['\"]"` -> replace string comparisons with enums/booleans.
  - `rg "\.endsWith\("` -> extract helpers for repeated logic.
  - Locate duplicate expressions and extract constants (especially ENS logic).
  - `rg "return.*<.*>"` -> watch for render functions.
  - `ast-grep -p '$VAR!'` -> eradicate non-null assertions.
  - Flag wrapper components that simply spread props.
  - `rg "export.*Name"` -> remove unused exports/imports.
  - Scan analytics payloads for snake_case outside ingestion layers.
  - Confirm analytics events recompute on data updates.
  - `rg "console\\.(log|debug|info|warn|error)\\("` -> remove or route through the logger.

- **Component architecture detection:**
  - `rg "interface.*Props.*{" -A 20` -> components with > 8-10 props need splitting.
  - `rg "enum.*(Behavior|Mode|Type|Config)"` -> validate that enums aren't hiding configuration anti-patterns.
  - `rg "props\?" | wc -l` -> high optional counts imply interface segregation issues.
  - Ensure single-use components live with their only consumer.
  - Replace `value?:` with `value: T | undefined` when applicable.

- **Performance review:**
  - Watch O(n^2) loops; prefer maps/sets for repeated lookups.
  - Stabilize hook dependencies and avoid recreating objects in render.

- **Interface changes:**
  - `rg "ComponentName"` to update every caller.
  - Remove unused destructured props/imports immediately.
  - Adjust dependency arrays when signatures shift.
  - Test all edge cases (loading, undefined data, errors).

- **Post-implementation command (if available):**
  ```bash
  pnpm lint && pnpm typecheck
  ```
  If a project provides a typecheck target instead of a script, run `pnpx nx run <project>:typecheck`.

### AI assistant contract

- Ask clarifying questions, output ready-to-paste code, minimize diff surface.
- Preserve existing patterns and focus on single-responsibility changes.
- Use `ast-grep`/`rg` for structural searches; auto-verify exports.
- Consider performance implications (state complexity, Map/Set usage).
- Replace manual enum arrays with `Object.values()`.

---

## Implementation Research & Debugging

### System integration & research

- Investigate existing systems before building new ones - use `rg` to find validation/error patterns.
- Prefer extending established flows over replacing them.
- Respect existing error messages and integration boundaries.
- Leverage project patterns instead of inventing new architectures for narrow problems.

### Simplicity & implementation philosophy

- Apply Occam's Razor: assume simple causes until disproven.
- Minimize surface area - prefer solutions touching fewer files.
- Question complex solutions (> 50 LOC) for missing existing abstractions.
- Know when not to be clever - clarity beats novelty.

- Prefer JSX over `React.createElement` for component rendering. Direct `createElement` usage should be reserved for low-level DOM manipulation utilities only.

### Storage and typing patterns

- `atomWithStorage` pattern: use `{ ...storage, getItem }` with `{ unstable_getOnInit: true }`; normalize on read in the adapter. Prefer a single storage atom; avoid extra wrapper atoms/migrate helpers when the adapter can handle shape cleanup.
- Chain typing: be explicit with `SupportedChainId` (e.g., `Record<SupportedChainId, ...>`). If you need partial/index signatures to satisfy TS initial states, document the compromise and guard unsupported IDs at runtime.
- Avoid redundant filtering/state churn (don't prune and filter the same items in multiple places).
- Recents/persisted lists: default to showing entries that exist in the current canonical/custom set; if product wants delisted/non-canonical entries to persist, add explicit hydration/fallback logic.

### Hook enhancement decision tree

- Domain-specific additions -> new enhancement hook.
- Universal improvements (< 10 lines) -> modify existing hook.
- > 20 lines specialized logic -> create a dedicated enhancement hook and document the rationale alongside the feature.

### Debugging methodology

- Follow the mandatory order: WHEN -> WHAT -> WHY -> DATA.
- Re-run with instrumentation before mutating code.

### Interface change protocol (enhanced)

- Search all usages, update every call, remove dead imports.
- Refresh dependency arrays, test edge cases, and ensure type safety.

---

## Reference Materials

- Repository README - command catalogue & verification scripts.
- `docs/` directory - debugging methodology, hook patterns, and other shared practices.
- Domain-specific notes live within the relevant module directories - link them in PRs when relevant.
- `CONTRIBUTING.md` - human-facing contribution rules; still applies.

---

Follow this playbook relentlessly. If a decision or code path conflicts with these guidelines, stop and realign before opening a PR.

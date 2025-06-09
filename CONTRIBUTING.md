# CoW Protocol Front-End • Contribution Guide

Welcome! This document is the canonical set of rules every contributor **and every code assistant** must obey.  
Make sure you follow them for a speedy review.

---

## 1. Development Quick-Start

### Install dependencies

```bash
yarn install
```

### Generate locale files

```bash
yarn i18n
```

### Run the interface

```bash
yarn start
```

---

## 2. Finding a First Issue

Start with issues labeled **Help Wanted**.

---

## 3. Pull Requests

| Rule           | Requirement                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| Target branch  | Open all PRs against develop                                                       |
| PR size        | ≤ ≈400 LOC; chain "waterfall" PRs for larger work                                  |
| Commit style   | Conventional Commits; PR title == squash message                                   |
| Approvals      | Two reviewers (frontend, qa) required                                              |
| Ownership      | Author assigns themselves, tags reviewers, keeps ≤ 3 open PRs, closes stale drafts |
| CI             | All checks must pass before review                                                 |
| Merge Strategy | Squash-merge to develop                                                            |

### Additional PR Guidelines

- Start from an issue from the sprint and link it in the PR when possible
- Every feature should go in a separate branch and pushed on its own PR
- If there are 2 approvals but some reviewer has pending comments, address them first before merging
- If your PR is already big and has no major blockers, it's ok to merge the features as they are and address the points raised in a follow up PR
- Keep PRs short when possible - you want reviewers to understand what you are trying to do
- For big features, break into smaller chunks and do "waterfall PRs" (pointing the second PR to the first PR's branch, and so on)
- Include a detailed description of what your PR is about in the summary
- Use screenshots when relevant
- Always include testing steps to your PR
- Make sure your PR builds successfully and keep it up to date with the source branch

---

## 4. Repository Architecture

**Monorepo Structure Principles:**

- `apps/` - Individual applications (cowswap-frontend, cow-fi, explorer, widget-configurator, etc.)
- `libs/` - Shared logic and utilities across applications
- `tools/` - Build and development utilities
- `testing/` - Integration test helpers

**Within cowswap-frontend:**

- `common/` - Shared utilities and components (MUST NOT depend on `modules/`)
- `modules/` - Feature-specific code organized by domain
- `pages/` - React Router page components
- `api/` - Service layer and API wrappers
- `types/` - Shared TypeScript type definitions

**Critical Architectural Rule:** The `common/` directory is leaf-only and MUST NOT depend on `modules/`. This ensures clean dependency flow and prevents circular dependencies.

---

## 5. Code Quality Rules

### TypeScript

- `strictNullChecks`, explicit types everywhere
- **TYPE EVERYTHING!!!** We prefer to add type definitions for most things in TypeScript
- Never use `any`; if unavoidable use `unknown` and add `// TODO` - `any` is bad and the linter will usually complain
- Prefer optional-chaining (`obj?.field`) over `&&` ladders (e.g. use `order?.bridgeDetails` instead of `order && order.bridgeDetails`)
- Encode variant data as `enum + Record<Enum, T>` so the compiler enforces exhaustiveness - TypeScript will error if you omit an enum key
- Explicit function return types required (`@typescript-eslint/explicit-function-return-type`)

### React

- Do not declare components inside another component's render
- Favour composition and named function components
- Use `const` only when a type annotation is needed
- Split large components into pure sub-components under `modules/<feature>/pure/`
- Prefer composition over configuration: split large components into smaller pure subcomponents (e.g. `pure/contents/*`) and compose them instead of adding config props

### General Code Quality

- Shorter functions are better than longer functions
- Abide by the structure of the respective projects
- Use Storybook when coding UI in a project that uses Storybook, Cosmos where Cosmos is used
- Code should be auto-formatted with rules defined in the project (ESLint)
- You are free to use whatever editor you fancy (VSCode, Intellij, vim, emacs), preferably with format on save (Prettier plugin)

**Keep functions small & prevent unnecessary re-renders.**

---

## 6. Performance & Memoisation (React 19)

| When to memoise                                                                       | When not to memoise                                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `useMemo` for heavyweight calculations rerunning on every render                      | Skip for trivial expressions or seldom-run code                                 |
| `useCallback` only when ref-equality matters (deps of useEffect, props of React.memo) | Don't wrap every callback "just in case"                                        |
| Wrap largely-static presentational components with React.memo                         | Avoid memo layers in deep hot trees where the comparison cost outweighs savings |

Additional Guidelines:

- Measure with DevTools/performance APIs before adding memoization
- Avoid memoizing inline objects/arrays used infrequently
- Don't preemptively memoize every value or callback—memo itself costs CPU & memory
- Skip memoization in deeply nested render paths where overhead outweighs benefit
- Avoid mixing memoization with dynamic patterns the React Compiler may optimize in the future

⚠️ **Antipattern**: Creating a child component inside a parent's render — causes remount, state reset, effect re-fire, focus loss. Always declare subcomponents outside or extract them.

---

## 7. Styling & Formatting

- ESLint + Prettier must pass; camelCase everywhere
- Import order:
  1. Core (react, jotai…)
  2. External (@cowprotocol/_, @uniswap/_, …)
  3. Internal absolute aliases (api/, common/, …)
  4. Relative paths
- Forbidden imports:
  - `@ethersproject/*` (use shared wrapper)
  - `styled-components` (use the macro variant)
  - `dist/` file paths
  - react-router's `useNavigate` (use common/hooks/useNavigate)

---

## 8. Testing

- Unit tests / integration tests required when applicable
- Jest unit tests for logic
- Storybook stories/Cosmos + interaction tests for every UI component
- Include integration tests
- Full CI must be green before review
- Make sure to TEST YOUR OWN PRs before requesting a review

---

## 9. Interaction Contract

1. Ask clarifying questions when requirements are ambiguous
2. Output only ready-to-paste code, using repo-root-relative paths
3. Keep changes minimal; avoid introducing extra re-renders
4. Preserve existing patterns and coding standards
5. Focus on single-responsibility changes

---

## 10. Development Communication

- Use descriptive commit messages, inline comments, and rich PR descriptions (expected behaviour & QA scope)
- Plan work up-front to keep each PR scoped to a single feature/fix

- Provide clear context about feature behavior and QA scope
- If you are stuck on anything, don't hesitate to reach out

---

---

<!--
## Translations
TODO: Re-enable when Crowdin flow is restored.
Help CoW Protocol reach a global audience! See Crowdin workflow in `.github/workflows/crowdin.yaml`.
-->

Thank you for helping keep CoW Protocol fast, stable, and enjoyable to hack on!

**Tip:** If you use Cursor or a similar assistant, set up proper rule files using the modern `.cursor/rules/` directory structure:

Create `.cursor/rules/frontend-guidelines.mdc`:

```markdown
---
description: CoW Protocol frontend development guidelines
globs: ['apps/**', 'libs/**']
alwaysApply: true
---

# CoW Protocol Frontend Guidelines

Follow ALL rules defined in CONTRIBUTING.md exactly.

@CONTRIBUTING.md
```

This ensures both human contributors and AI assistants adhere to consistent coding standards in this repository.

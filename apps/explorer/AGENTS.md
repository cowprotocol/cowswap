---
author: agents
status: normative
last_reviewed: 2026-05-06
---

# explorer AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: explorer app-specific commands and UI conventions.

## App commands
- Start dev server: `pnpm start:explorer`
- Build: `pnpm build:explorer`
- Preview: `pnpx nx run explorer:preview`
- Lint: `pnpx nx run explorer:lint`
- Test: `pnpx nx run explorer:test`
- Cosmos: `pnpm start:cosmos:explorer`

## Link and address display conventions

- `MUST` append `↗` to link text for external links (block explorer, etherscan). Do this for address links and contract links.
- `MUST NOT` append `↗` to token symbol links — token names are never suffixed with the external link indicator.
- `MUST` render parentheses around address links as plain text nodes outside the `<a>` tag, not inside it. E.g. `(<a href={url}>{shortAddress}↗</a>)`.
- `MUST` wrap `(link)` constructs in a single `<span>` when inside a flex container, otherwise `gap` inserts space between the parens and the link text.
- `MUST` use `Color.explorer_textActive` (orange) explicitly for link `color` inside styled components. Do not use `color: inherit` on `a` elements inside styled components — it will inherit the surrounding prose color (grey) instead of the global orange.

## Token display

- `MUST` show a `TokenImg` icon before a linked token symbol. Size the icon to match the surrounding font-size context (e.g. `width: 2rem; height: 2rem` when `font-size: 2rem`).
- Styled containers wrapping token links `MUST` use `display: flex; align-items: center` so the icon and text sit on the same baseline.

## Text wrapping inside RenderedData

- `RenderedData` sets `word-break: break-all`. Any child component that contains prose text `MUST` override this with `word-break: normal` to get word-level wrapping instead of character-level wrapping.

## State caching outside React

- Use `jotai` or `jotai-family` to handle any outside-react caching.

## Address utilities

- `MUST` type address parameters as `AddressKey` from `@cowprotocol/cow-sdk`, not plain `string`.
- `MUST` use `shortenAddress` from `@cowprotocol/common-utils` to abbreviate addresses. `MUST NOT` manually slice (`address.slice(0, 6)…address.slice(-4)`).
- `MUST` use `getAddressKey()` from `@cowprotocol/cow-sdk` when looking up addresses in registries or maps (e.g. `WRAPPERS_BY_ADDRESS`). `MUST NOT` use `address.toLowerCase()` for this purpose (root rule, repeated here for emphasis).

## React imports

- `MUST` import React types directly by name (`ComponentType`, `ReactElement`, `ReactNode`, etc.). `MUST NOT` use `React.ComponentType` / `React.ReactElement` prefix form — it couples the import to the default namespace unnecessarily.

## Contract reads

- `MUST` batch multiple reads from the same contract into a single `multicall` call rather than issuing separate `readContract` calls. For example, fetching `symbol`, `name`, and `decimals` for an ERC-20 should be one `multicall`.

## Hook and component organisation

- `MUST` put each hook in its own file under a domain directory (e.g. `hooks/euler/useVaultAsset.ts`). `MUST NOT` bundle unrelated hooks in one file.
- Wrapper components that render decoded data `SHOULD` extract a `*View` sub-component with all props passed explicitly and no hooks, to satisfy lint complexity limits.

## Before committing

- `SHOULD` run `pnpm nx run explorer:lint` and fix all violations.
- `SHOULD` delete any exports, hooks, or components with no callers introduced or left behind by the change.

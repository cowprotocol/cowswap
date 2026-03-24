# Price chart

## 1) Purpose

Provide a single app-local integration point for historical OHLCV price data used by the swap chart.

This module owns the Codex fetcher, request normalization, response validation, low-volume diagnostics, and the swap-owned pure chart component.

## 2) Responsibilities

- Fetch token bar history from Codex via `@codex-data/sdk`
- Normalize frontend query params into Codex request params
- Validate Codex responses before chart code consumes them
- Map Codex bar arrays into app-friendly `PriceChartBar[]`
- Log fetch start/success/failure through `logPriceChart`

## 3) Internal structure

- `api/`: Codex fetching + logging
- `lib/`: TradingView adapter/runtime glue + shared types/constants
- `pure/`: chart UI owned by Swap

## 4) Data flow

The `PriceChart` component requests historical bars from this module's API layer.

The API layer talks to Codex.

The API layer returns normalized bars or throws a typed error path back to the caller.

```mermaid
flowchart LR
  Swap[Swap page]
  PriceChartUi[PriceChart pure UI + TradingView adapter]
  PriceChartApi[priceChart API]
  Codex[Codex API]

  Swap --> PriceChartUi
  PriceChartUi --> PriceChartApi
  PriceChartApi --> Codex
  Codex --> PriceChartApi
  PriceChartApi --> PriceChartUi
```

## 5) Request model

The public entry point is `fetchPriceChartData(params)`.

Inputs:

- `address`
- `chainId`
- `from`
- `to`
- `resolution`
- `currencyCode`
- optional `countback`
- optional empty/null trimming flags

Codex symbol format:

- `${address}:${chainId}`

Important:

- Native assets must be resolved to their wrapped token address before they reach this module
- This module expects a real token contract address, not the `0xeeee...` native sentinel

## 6) Response model

Codex returns array-shaped bar data.

This module:

- rejects inconsistent array lengths
- drops bars with null OHLC fields
- preserves bar time as Unix seconds
- leaves TradingView-specific adaptation to the caller

## 7) Runtime behavior

- WS is disabled
- requests use `fetchWithTimeout`
- API key resolution order:
  1. `CODEX_API_KEY_ENV`
  2. `LEGACY_DEFINED_API_KEY_ENV`
  3. built-in fallback test key

## 8) File structure

- `api/`
- `api/fetchPriceChartData.ts`: public Codex fetcher
- `api/logPriceChart.ts`: scoped diagnostics
- `lib/priceChart.types.ts`: query + bar types
- `lib/priceChart.constants.ts`: env names, timeout, fallback key
- `lib/tradingView*.ts`: TradingView adapter/datafeed glue
- `lib/symbolCatalog.ts`: swap-derived chart symbols
- `lib/charting_library/`: vendored TradingView runtime types/loader
- `pure/PriceChart/PriceChart.container.tsx`
- `pure/PriceChart/PriceChart.pure.tsx`
- `pure/PriceChart/PriceChart.styled.ts`

## 9) Architecture note

`priceChart` now owns both:

- the price-history API boundary
- the swap-owned pure chart component

The internal split is:

- `api/` for external data fetching
- `lib/` for adapter/runtime helpers
- `pure/` for UI

This is a better fit than the old `modules/proChart` naming, which described implementation style instead of ownership.

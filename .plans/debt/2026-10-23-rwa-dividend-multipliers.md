# RWA dividend multipliers are approximated from market prices

Status: open
Owner: Frontend (RWA UI)
Created: 2026-10-23
Area: apps/rwa-frontend

## Problem

FE-958 values RWA positions with per-token market prices and derives the equivalent shares of a
price-accrual token (Ondo) as `max(balance, value / stock price)`. That is an approximation of the
issuer's real shares multiplier:

- Equivalent shares move with market noise (±0.1–0.3% between a token and the stock) instead of the
  multiplier, and a token at a discount is floored at its balance.
- 21 wrapped xStocks tokens (`WNVDAX`, `WMSTRX`, …, CoinGecko ids `wrapped-*-xstock`: 18 on Arbitrum,
  2 on Ink, 1 on Ethereum) are classified by issuer as `rebase`. A wrapper does not rebase, so their
  equivalent shares omit accrued dividends and the xStocks footnote does not describe them. Their USD
  value is correct.
- Quote ranking ("Best quote", `isPriceOutlier` in `_pages/asset/lib/quotedTokens.ts`) compares price
  per token, so it slightly penalises tokens that accrue dividends in their price.
- `fetchAssetsByTickers` (`entities/asset/api/assetsQueries.ts`) flattens pages into an array and drops
  `degraded`, so the IndexedDB persistence saves a degraded portfolio markets response. A failed
  `/coins/markets` load can replace good token prices with `tokens: {}`, and Ondo positions fall back to
  the stock price until the next successful load. Fixing it changes the persisted shape (bump
  `STORE_NAME`).
- xStocks pauses interactions ~15 minutes around each multiplier activation (00:30 UTC on the day after
  the ex date). The app does not show that window.

## Why It Exists

Exact multipliers need issuer data the app does not have yet: Ondo's market-data API
(`sharesMultiplier`) requires an `x-api-key`, and its onchain `SyntheticSharesOracle` covers only a few
assets. Today's accrued premiums are about the size of DEX price noise, so normalising quotes with an
approximation would reshuffle "Best quote" without being more correct.

## Paydown Plan

1. Classify the dividend model per token, not per issuer (wrapped xStocks → `price-accrual`), in
   `entities/asset/model/issuers.ts`.
2. Load multipliers server-side through `assetsService`: Ondo
   `/v1/assets/{symbol}/market` (`primaryMarket.sharesMultiplier`, needs a key) and xStocks
   `https://api.xstocks.fi/api/v2/public/assets/{SYMBOL}/multiplier?network={NETWORK}` (also returns
   the pending multiplier and its activation time).
3. Compute equivalent shares as `balance × multiplier`, and rank quotes by price per share.
4. Show the xStocks pause window on the asset page and the trade widget.

## Exit Criteria

- Equivalent shares equal `balance × issuer multiplier` for every registry token.
- Quote ranking compares prices per underlying share.

## Notes

- Linear: https://linear.app/cowswap/issue/FE-958/handle-dividends-and-balance-differences-between-providers-ondo-vs
- Spec: `docs/superpowers/specs/2026-10-22-rwa-provider-dividends-design.md`
- Ondo API: https://docs.ondo.finance/api-reference/assets/get-market-data-for-an-asset
- xStocks multipliers: https://docs.xstocks.fi/developers/multipliers

# RWA: provider dividend models (Ondo vs xStocks)

Linear: [FE-958](https://linear.app/cowswap/issue/FE-958/handle-dividends-and-balance-differences-between-providers-ondo-vs)

## Goal

Issuers treat dividends differently, so token balances and prices of the same underlying stock are not
directly comparable:

- **Ondo** reinvests dividends by raising the redemption price: one token represents a growing number of
  shares (`sharesMultiplier` in their API). Balances never change; the token trades at a growing premium
  over the stock price.
- **xStocks** reinvests dividends by rebasing balances: on EVM `balanceOf()` already returns the adjusted
  amount, so one token stays close to one share and the token price stays close to the stock price.

Today the app assumes one token is one share everywhere. That understates Ondo position values and
equivalent shares (the gap grows with every dividend), and shows Ondo's legitimate dividend premium as an
unexplained "% vs stock" deviation.

The chosen approach (per product decision on FE-958): **value positions with per-token market prices and
explain the issuer differences in place** — no issuer APIs, no exact multipliers.

## Decisions

- **Value, not multiplier.** A token's USD value is `units × token price` (CoinGecko per-token price),
  falling back to the aggregate stock price when the token has no price. This is provider-agnostic: it is
  correct for price-accrual tokens, rebasing tokens, and depegs alike, and needs no issuer API key
  (Ondo's market-data API requires one; their onchain oracle covers only a few assets).
- **Equivalent shares by dividend model.** For rebasing issuers shares stay `units` (the chain already
  rebases). For price-accrual issuers shares are derived from `value / stock price` when both prices
  are known — internally consistent with the value shown — else fall back to `units`.
- **Quote ranking and outlier detection stay as they are.** Normalising `pricePerShare` by a
  CoinGecko-derived multiplier would move "Best quote" within market noise today (accrued premiums are
  currently ~0–3%, comparable to DEX price noise). Exact multipliers need the Ondo API. Explain the
  premium instead; track normalisation as debt (`.plans/debt/`).
- **The dividend model is keyed by issuer, not by deployment.** xStocks' developer docs state that on
  EVM `balanceOf()` returns the multiplier-adjusted balance (the raw-amount-plus-wallet-multiplier
  scheme is Solana/TON only), and the registry holds EVM deployments only, so one model per issuer
  covers every registry token today. If a wrapped non-rebasing variant ever lands in the registry, the
  config gains per-token granularity then; a wrong key here degrades to today's 1:1 behaviour, not to a
  crash.
- **Equivalent shares never drop below the balance** for price-accrual issuers:
  `shares = max(units, value / stock price)`. The true multiplier is ≥ 1 by construction (dividends only
  accrue), so a market discount is a worse approximation of it than the balance itself — and an
  unfloored figure would contradict the explainer right above it. The USD value stays market-based
  (unfloored), so a depeg still shows where it belongs.
- **Issuer knowledge lives in one config** in `entities/asset`, the single source of truth for allowed
  issuers, their dividend model, and the explainer copy. `validateRegistry.ts` derives its allowlist from
  it (`scripts/updateRegistry.mjs` stays a separate copy: it runs outside the TS build).
- **No IndexedDB store bump.** `RwaMarketData.tokens` already exists on every response (`{}` outside the
  asset page), so filling it in the assets list is not a type change. Restored stale entries with `{}`
  degrade to today's valuation until the refetch lands.
- **Explainers use the existing pattern**: `title` attribute + `InfoIcon` / `cursor: help`
  (`MarketTotalsCard`, `TradeTokenSelector`) and `tableStyles.warning` footnotes. No new tooltip
  component.

## Issuer config

New `src/entities/asset/model/issuers.ts`, exported through `@/entities/asset`:

```ts
export const RWA_ISSUERS = ['Ondo', 'xStocks'] as const
export type RwaIssuer = (typeof RWA_ISSUERS)[number]

/**
 * How the issuer passes dividends on to holders.
 * - `price-accrual`: dividends raise the token's redemption price; one token represents a growing
 *   number of shares (Ondo)
 * - `rebase`: dividends increase token balances; one token stays one share (xStocks)
 */
export type RwaDividendModel = 'price-accrual' | 'rebase'

export const ISSUER_DIVIDEND_MODELS: Record<RwaIssuer, RwaDividendModel> = {
  Ondo: 'price-accrual',
  xStocks: 'rebase',
}

/** `null` for an issuer missing from the registry allowlist */
export function getDividendModel(issuer: string): RwaDividendModel | null
```

`RwaToken.issuer` stays `string` (the registry is JSON; the runtime allowlist already rejects unknown
issuers), so every consumer goes through `getDividendModel` and handles `null` by falling back to the
current 1:1 behaviour. `validateRegistry.ts` replaces its local `ALLOWED_ISSUERS` with `RWA_ISSUERS`.

Copy (interpolate the issuer name; keyed by model so a future issuer reuses it):

- `price-accrual`: "{issuer} reinvests dividends into the token price, so one token is worth more than
  one share. The premium over the stock price is accrued dividends, not mispricing."
- `rebase`: "{issuer} reinvests dividends by increasing token balances, so one token stays close to one
  share."

## Server

`listAssets` (`entities/asset/api/assetsService.ts`) loads token markets when the request filters by
`tickers` (the portfolio's path; home-page listings keep the lean response):

- `tickers` set → `loadTokenMarkets(matchedAssets.flatMap((a) => a.tokens))`, pass the result into
  `toMarketData`, and OR `tokenMarkets === null` into `degraded` (same contract as `getAsset`).
- The `RwaMarketData.tokens` doc comment changes to "Filled by `/asset/{ticker}` and tickers-filtered
  `/assets` only, `{}` elsewhere".
- Upstream cost: `/coins/markets` is batched over the whole registry and cached per URL, so this adds no
  new upstream request shape.

No `RwaAggregateMarket` change → no `RWA_MARKETS_CACHE_KEY` bump.

## Client

### Portfolio (`_pages/portfolio`)

`buildHoldings` takes a per-token price lookup alongside the asset price:

- `TokenHolding.value = units × (tokenPrice ?? assetPrice)` (null when neither is known).
- `TokenHolding.shares`: rebase or unknown model → `units`; price-accrual →
  `max(units, value / assetPrice)` when `value` and a positive `assetPrice` exist, else `units`.
- `Holding.shares`/`Holding.value` stay sums; `getPortfolioTotals` is unchanged.
- The `/** One token is one share */` comment goes away with the assumption.

`usePortfolio.getPrice` gains a token-level variant. `RwaTokenSummary` (what positions carry) has no
`coingeckoId`, so the lookup joins by `getTokenKey` against the full `RwaAsset.tokens` of the portfolio
markets response (`RwaAssetListItem` extends `RwaAsset`) to resolve `coingeckoId`, then reads
`market.tokens[coingeckoId]?.price`. The summary type stays untouched.

`HoldingsTable`: token sub-rows keep showing the raw balance (what the wallet holds). When any shown
holding has a price-accrual or rebase token, a `warning`-style footnote under the table carries the
matching copy (one line per model present), so the parent "Equivalent shares" exceeding the summed
balances — and balances that grow on their own — are explained.

### Asset page positions (`_pages/asset/ui/PositionsTab.tsx`)

Value uses the per-token price already available on the asset page:
`units × (market.tokens[coingeckoId]?.price ?? market.price)` (here positions carry the full `RwaToken`,
so `coingeckoId` is at hand). Same conditional footnote as the portfolio.

### Stock tokens table (`_pages/asset/ui/StockTokens.tsx`)

The "% vs stock" secondary line for price-accrual issuers gets the `price-accrual` copy as a `title`
hint (`cursor: help`), so the premium reads as dividends, not mispricing.

### Trade token selector (`_pages/asset/ui/TradeTokenSelector.tsx`)

The per-quote "% vs stock" line gets the same conditional `title` hint. Ranking, "Best quote", and
`isPriceOutlier` are untouched (see Decisions).

## Testing

- `issuers`: `getDividendModel` for every allowed issuer and for an unknown string.
- `validateRegistry.test.ts`: still rejects unknown issuers (allowlist now imported).
- `holdings.test.ts`: per-token price valuation, fallback to asset price, price-accrual share
  derivation and its floor at units (token at a discount), fallback to units without prices, rebase
  unchanged.
- `assetsService.test.ts`: `listAssets` fills `market.tokens` with `tickers` set, leaves `{}` without,
  degrades when token markets fail.
- Verification: `pnpx nx run rwa-frontend:lint`, `pnpx nx run rwa-frontend:test`,
  `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`.

## Out of scope

- Exact share multipliers (Ondo market-data API needs a key; `SyntheticSharesOracle` covers few assets).
- xStocks rebase pause windows (trading blocked ~15 min around multiplier activation).
- Quote ranking normalisation across dividend models (debt, revisit with real multiplier data).
- The CoW Swap frontend (`modules/rwa`): it has no comparison/position surfaces.
- Registry/updateRegistry changes: no new issuers are added here.

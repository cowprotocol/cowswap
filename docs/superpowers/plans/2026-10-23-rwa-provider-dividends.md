# RWA provider dividends Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Value RWA positions with per-token prices and explain Ondo (price-accrual) vs xStocks (rebase) dividend handling in the comparison, position and portfolio views.

**Architecture:** A new issuer config in `entities/asset` maps each issuer to a dividend model and explainer copy. The server fills per-token markets for tickers-filtered `/api/v1/assets` (the portfolio's request). `buildHoldings` values each token with its own price and derives Ondo equivalent shares from value; UI surfaces add `title` hints and footnotes.

**Tech Stack:** Next.js, React, TypeScript, Jotai + jotai-tanstack-query, Jest, CSS Modules. All paths below are relative to `apps/rwa-frontend/`.

**Spec:** `docs/superpowers/specs/2026-10-22-rwa-provider-dividends-design.md`

## Global Constraints

- Root `AGENTS.md` and `apps/rwa-frontend/AGENTS.md` apply: no `any`, no non-null `!`, `areAddressesEqual`/`getTokenKey` for addresses, FSD import direction, slice public API only (`@/entities/asset`), CSS Modules.
- Comments only for workarounds or difficult math; doc comments on exported API only for range/default/unit.
- No IndexedDB `STORE_NAME` bump and no `RWA_MARKETS_CACHE_KEY` bump (no shape change).
- Ranking, "Best quote" and `isPriceOutlier` in `quotedTokens.ts` stay unchanged.
- Copy, verbatim (interpolate `{issuer}`):
  - `price-accrual`: `{issuer} reinvests dividends into the token price, so one token is worth more than one share. The premium over the stock price is accrued dividends, not mispricing.`
  - `rebase`: `{issuer} reinvests dividends by increasing token balances, so one token stays close to one share.`
- Do not commit. Each task ends by staging its files (`git add`); the user commits with a hardware key.
- Never run `pnpm lint --fix`.

## Review Focus

- An Ondo token with no `coingeckoId`, or missing from `market.tokens` (stale IndexedDB entry, failed token markets): value falls back to the stock price and equivalent shares equal the balance — pinned in Task 3.
- An Ondo token trading below the stock price: equivalent shares are floored at the balance, value stays market-based — pinned in Task 3.
- Stock price unknown but the token price known: value comes from the token price, shares equal the balance (nothing to divide by) — pinned in Task 3.
- A position whose address casing differs from the registry: the token price lookup still matches (`getTokenKey` join) — pinned in Task 3.
- Token markets failing on the portfolio request: response is `degraded`, `market.tokens` is `{}`, asset prices still served — pinned in Task 2.

---

### Task 1: Issuer config

**Files:**
- Create: `src/entities/asset/model/issuers.ts`
- Create: `src/entities/asset/model/issuers.test.ts`
- Modify: `src/entities/asset/model/validateRegistry.ts:9-10` (drop local `ALLOWED_ISSUERS`, use `RWA_ISSUERS`; keep the "must match `scripts/updateRegistry.mjs`" note on the moved constant)
- Modify: `src/entities/asset/index.ts` (export the new API)
- Test: `src/entities/asset/model/validateRegistry.test.ts` (existing issuer cases must keep passing unchanged)

**Interfaces:**
- Produces (exported from `@/entities/asset`):
  - `RWA_ISSUERS: readonly ['Ondo', 'xStocks']`, `type RwaIssuer`
  - `type RwaDividendModel = 'price-accrual' | 'rebase'`
  - `getDividendModel(issuer: string): RwaDividendModel | null`
  - `getDividendNotes(issuers: Iterable<string>): string[]` — one copy line per distinct known issuer, in first-seen order; unknown issuers are skipped

- [ ] **Step 1: Write the failing tests** in `issuers.test.ts`

```ts
describe('getDividendModel', () => {
  it('maps every allowed issuer', () => {
    expect(getDividendModel('Ondo')).toBe('price-accrual')
    expect(getDividendModel('xStocks')).toBe('rebase')
  })
  it('is null for an unknown issuer', () => {
    expect(getDividendModel('Dinari')).toBeNull()
  })
})

describe('getDividendNotes', () => {
  it('returns one note per distinct known issuer', () => {
    expect(getDividendNotes(['Ondo', 'xStocks', 'Ondo', 'Dinari'])).toEqual([
      'Ondo reinvests dividends into the token price, so one token is worth more than one share. The premium over the stock price is accrued dividends, not mispricing.',
      'xStocks reinvests dividends by increasing token balances, so one token stays close to one share.',
    ])
  })
  it('is empty without known issuers', () => {
    expect(getDividendNotes([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpx nx run rwa-frontend:test -- --testPathPattern=entities/asset/model/issuers`
Expected: FAIL, cannot find module `./issuers`

- [ ] **Step 3: Implement `issuers.ts`** with `RWA_ISSUERS`, a `Record<RwaIssuer, RwaDividendModel>` (`Ondo: 'price-accrual'`, `xStocks: 'rebase'`), copy keyed by model as `(issuer: string) => string`, and the two functions above. Put the spec's model doc comment on `RwaDividendModel`. Then switch `validateRegistry.ts` to `RWA_ISSUERS` and add the exports to `index.ts`.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpx nx run rwa-frontend:test -- --testPathPattern="entities/asset/model/(issuers|validateRegistry)"`
Expected: PASS, including `'"Dinari" is not an allowed issuer (Ondo, xStocks)'`

- [ ] **Step 5: Stage**

```bash
git add src/entities/asset/model/issuers.ts src/entities/asset/model/issuers.test.ts src/entities/asset/model/validateRegistry.ts src/entities/asset/index.ts
```

---

### Task 2: Per-token markets on tickers-filtered `/api/v1/assets`

**Files:**
- Modify: `src/entities/asset/api/assetsService.ts:152-174` (`listAssets`)
- Modify: `src/entities/asset/model/types.ts:77` (`RwaMarketData.tokens` doc comment → `Keyed by \`RwaToken.coingeckoId\`. Filled by \`/asset/{ticker}\` and tickers-filtered \`/assets\` only, \`{}\` elsewhere`)
- Test: `src/entities/asset/api/assetsService.test.ts` (`describe('listAssets')`)

**Interfaces:**
- Produces: `RwaAssetsPage.items[].market.tokens` filled for every item when `tickers` is set; `degraded` also true when token markets fail. Shape unchanged.

- [ ] **Step 1: Write the failing tests** in `describe('listAssets')`

```ts
it('fills the token markets of the matched assets when filtered by tickers', async () => {
  const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['NVDA'] })

  expect(getTokenMarketsMock).toHaveBeenCalledWith(nvda().tokens)
  expect(page.items[0]?.market?.tokens).toEqual(NVDA_TOKEN_MARKETS)
  expect(page.degraded).toBe(false)
})

it('keeps the asset prices and degrades when token markets fail', async () => {
  getTokenMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

  const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['NVDA'] })

  expect(page.degraded).toBe(true)
  expect(page.items[0]?.market).toMatchObject({ price: 180, tokens: {} })
})
```

The existing first test (`expect(getTokenMarketsMock).not.toHaveBeenCalled()` without `tickers`) must stay green.

- [ ] **Step 2: Run to verify they fail**

Run: `pnpx nx run rwa-frontend:test -- --testPathPattern=entities/asset/api/assetsService`
Expected: FAIL, `getTokenMarketsMock` not called / `tokens` is `{}`

- [ ] **Step 3: Implement** — in `listAssets`, when `filter.tickers?.length`, load `loadRwaMarkets()` and `loadTokenMarkets(matched.flatMap((asset) => asset.tokens))` in parallel (filter first, then load; `filterAssets` needs no market data), pass `tokenMarkets ?? {}` into `toMarketData`, and OR `tokenMarkets === null` into `degraded`. Without `tickers`, behaviour is unchanged.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpx nx run rwa-frontend:test -- --testPathPattern=entities/asset/api/assetsService`
Expected: PASS

- [ ] **Step 5: Stage**

```bash
git add src/entities/asset/api/assetsService.ts src/entities/asset/api/assetsService.test.ts src/entities/asset/model/types.ts
```

---

### Task 3: Portfolio valuation and footnote

**Files:**
- Modify: `src/_pages/portfolio/lib/holdings.ts` (`buildHoldings`, `TokenHolding.shares` doc)
- Modify: `src/_pages/portfolio/model/usePortfolio.ts:86-103` (price lookups)
- Modify: `src/_pages/portfolio/ui/HoldingsTable.tsx` (footnote)
- Test: `src/_pages/portfolio/lib/holdings.test.ts`

**Interfaces:**
- Consumes: `getDividendModel`, `getDividendNotes` from Task 1; filled `market.tokens` from Task 2.
- Produces:

```ts
export interface HoldingPrices {
  /** USD per share of the underlying */
  getAssetPrice(asset: RwaAssetSummary): number | null
  /** USD per token */
  getTokenPrice(token: RwaTokenSummary): number | null
}

export function buildHoldings(assets: RwaAssetSummary[], positions: Position[], prices: HoldingPrices): Holding[]
```

Rules (from the spec):
- `TokenHolding.value = units × (tokenPrice ?? assetPrice)`, `null` when both are `null`.
- `TokenHolding.shares`: `price-accrual` with a value and `assetPrice > 0` → `Math.max(units, value / assetPrice)`; otherwise `units`.
- `Holding.price` stays the asset price; `Holding.shares` is the sum; `Holding.value` is the sum of token values, `null` when any token value is `null` (so `getPortfolioTotals.unpricedAssets` still counts it).
- `getPortfolioTotals` unchanged.

- [ ] **Step 1: Update the existing tests and write the failing ones** in `holdings.test.ts`

Replace `getPrice` with `const prices = (tokenPrices: Record<string, number> = {}): HoldingPrices => ({ getAssetPrice: (asset) => PRICES[asset.ticker] ?? null, getTokenPrice: (token) => tokenPrices[getTokenKey(token)] ?? null })` and pass `prices()` in every existing call (their expectations stay the same). Add an Ondo token `AAPLON: RwaToken = { ...AAPLX, address: '0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c', symbol: 'AAPLon', issuer: 'Ondo' }` to `AAPL.tokens`. New cases (`ONE = '1000000000000000000'`):

```ts
it('values each token at its own price', () => {
  const [apple] = buildHoldings([AAPL], [{ token: AAPLX, balance: ONE }, { token: AAPLON, balance: ONE }],
    prices({ [getTokenKey(AAPLON)]: 210 }))

  expect(apple?.tokens.map(({ value }) => value)).toEqual([200, 210])
  expect(apple?.value).toBe(410)
})

it('derives Ondo equivalent shares from the token value', () => {
  const [apple] = buildHoldings([AAPL], [{ token: AAPLON, balance: ONE }], prices({ [getTokenKey(AAPLON)]: 210 }))

  expect(apple?.shares).toBeCloseTo(1.05)
})

it('never shows fewer Ondo shares than tokens when the token trades at a discount', () => {
  const [apple] = buildHoldings([AAPL], [{ token: AAPLON, balance: ONE }], prices({ [getTokenKey(AAPLON)]: 190 }))

  expect(apple?.shares).toBe(1)
  expect(apple?.value).toBe(190)
})

it('falls back to the stock price and one share per token without a token price', () => {
  const [apple] = buildHoldings([AAPL], [{ token: AAPLON, balance: ONE }], prices())

  expect(apple?.shares).toBe(1)
  expect(apple?.value).toBe(200)
})

it('values a token by its own price when the stock price is unknown', () => {
  const [spy] = buildHoldings([SPY], [{ token: SPYX, balance: ONE }], prices({ [getTokenKey(SPYX)]: 600 }))

  expect(spy?.value).toBe(600)
  expect(spy?.shares).toBe(1)
})

it('keeps a rebasing token at one share per token above the stock price', () => {
  const [apple] = buildHoldings([AAPL], [{ token: AAPLX, balance: ONE }], prices({ [getTokenKey(AAPLX)]: 210 }))

  expect(apple?.shares).toBe(1)
  expect(apple?.value).toBe(210)
})

it('has no holding value while one of its tokens is unpriced', () => {
  const [spy] = buildHoldings([{ ...SPY, tokens: [SPYX, AAPLON] }],
    [{ token: SPYX, balance: ONE }, { token: AAPLON, balance: ONE }], prices({ [getTokenKey(SPYX)]: 600 }))

  expect(spy?.value).toBeNull()
})
```

Casing case — add a test reusing the first test's positions (lower-cased `AAPLX` address, 1.5 units; `AAPLX_BNB`, 0.5 units) with `prices({ [getTokenKey(AAPLX)]: 210 })`:

```ts
expect(apple?.tokens.map(({ value }) => value)).toEqual([315, 100])
expect(apple?.value).toBe(415)
expect(apple?.shares).toBe(2)
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpx nx run rwa-frontend:test -- --testPathPattern=_pages/portfolio/lib/holdings`
Expected: FAIL (type error on `HoldingPrices` / wrong values)

- [ ] **Step 3: Implement `buildHoldings(assets, positions, prices)`** per the rules above; replace the `/** One token is one share */` doc on `TokenHolding.shares` with `Shares of the underlying the token represents`.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpx nx run rwa-frontend:test -- --testPathPattern=_pages/portfolio/lib/holdings`
Expected: PASS

- [ ] **Step 5: Wire `usePortfolio`** — build a `Map<string, number | null>` from `markets`: for each `item` and each `token` of `item.tokens` with a `coingeckoId`, key `getTokenKey(token)` → `item.market?.tokens[token.coingeckoId]?.price ?? null`. Pass `{ getAssetPrice, getTokenPrice: (token) => map.get(getTokenKey(token)) ?? null }` to both `buildHoldings` calls. Add the map to the `useMemo` deps (or derive it from `markets` in its own `useMemo`).

- [ ] **Step 6: Add the footnote to `HoldingsTable`** — `getDividendNotes(holdings.flatMap(({ tokens }) => tokens.map(({ token }) => token.issuer)))`; render each note as `<p className={styles.warning}>` below the table's scroll container, nothing when empty. Wrap the return in a fragment.

- [ ] **Step 7: Typecheck and test**

Run: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit` (from the repo root) and `pnpx nx run rwa-frontend:test -- --testPathPattern=_pages/portfolio`
Expected: no errors; PASS

- [ ] **Step 8: Stage**

```bash
git add src/_pages/portfolio/lib/holdings.ts src/_pages/portfolio/lib/holdings.test.ts src/_pages/portfolio/model/usePortfolio.ts src/_pages/portfolio/ui/HoldingsTable.tsx
```

---

### Task 4: Asset page positions and comparison hints

**Files:**
- Modify: `src/_pages/asset/ui/PositionsTab.tsx` (per-token value, footnote)
- Modify: `src/_pages/asset/ui/StockTokens.tsx:149-151` (hint on "% vs stock")
- Modify: `src/_pages/asset/ui/TradeTokenSelector.tsx:201-203` (hint on "% vs stock")
- Modify: `src/_pages/asset/ui/AccountTable.module.css` (add `.hint { cursor: help; }`)
- Modify: `src/_pages/asset/ui/TradeTokenSelector.module.css` (same `.hint`, unless `.info` already fits a text span — reuse it if so)

**Interfaces:**
- Consumes: `getDividendModel`, `getDividendNotes` from Task 1. Positions here carry full `RwaToken`, so `coingeckoId` is direct.

- [ ] **Step 1: `PositionsTab`** — read the whole `market` (not only `price`) from `assetQueryAtomFamily`; value each row as `units × ((token.coingeckoId ? market?.tokens[token.coingeckoId]?.price : null) ?? market?.price)`, `formatUsd(null)` when neither exists. Below the table, render `getDividendNotes(positions.map(({ token }) => token.issuer))` as `<p className={styles.warning}>` lines.

- [ ] **Step 2: `StockTokens` and `TradeTokenSelector`** — when `getDividendModel(token.issuer) === 'price-accrual'`, give the "% vs stock" `<span>` `title={note}` (the single note from `getDividendNotes([token.issuer])[0]`) and the `.hint` class alongside `secondary`. Rebase tokens get no hint (their deviation is tracking noise, which the copy doesn't describe).

- [ ] **Step 3: Typecheck, lint and test the app**

Run from the repo root:
- `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit` → no errors
- `pnpx nx run rwa-frontend:lint` → passes (includes steiger FSD check)
- `pnpx nx run rwa-frontend:test` → all PASS

- [ ] **Step 4: Check in the browser** — `pnpm start:rwa`, open `http://localhost:3000/rwa/asset/NVDA`: Ondo rows show the hint on "% vs stock" in Stock tokens and the trade selector; with a wallet holding an Ondo token, Positions shows the per-token value and the Ondo note; `/rwa/portfolio` shows the note and Ondo equivalent shares ≥ balance.

- [ ] **Step 5: Stage**

```bash
git add src/_pages/asset/ui/PositionsTab.tsx src/_pages/asset/ui/StockTokens.tsx src/_pages/asset/ui/TradeTokenSelector.tsx src/_pages/asset/ui/AccountTable.module.css src/_pages/asset/ui/TradeTokenSelector.module.css
```

---

### Task 5: Debt record

**Files:**
- Create: `.plans/debt/2026-10-23-rwa-dividend-multipliers.md` (repo root, from `.plans/TEMPLATE.debt.md`)

- [ ] **Step 1: Write the debt item** covering the spec's "Out of scope" list that is real debt: exact share multipliers (Ondo `sharesMultiplier` API needs `x-api-key`; `SyntheticSharesOracle` covers few assets), quote-ranking normalisation across dividend models, and xStocks rebase pause windows (~15 min around 00:30 UTC multiplier activation, `api.xstocks.fi/api/v2/public/assets/{SYMBOL}/multiplier`). Link FE-958 and the spec.

- [ ] **Step 2: Harness check**

Run: `pnpm agents:check` (repo root)
Expected: passes

- [ ] **Step 3: Stage**

```bash
git add .plans/debt/2026-10-23-rwa-dividend-multipliers.md docs/superpowers/specs/2026-10-22-rwa-provider-dividends-design.md docs/superpowers/plans/2026-10-23-rwa-provider-dividends.md
```

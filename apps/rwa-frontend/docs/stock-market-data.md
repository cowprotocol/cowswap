# Stock market data (rwa-frontend)

What the asset page needs from a stock market data provider, and what Ondo gives us today.

Checked 2026-11-05 against the live Ondo API (`https://api.gm.ondo.finance`, key `ONDO_API_KEY`) with NVDA.
Related research: [RWA stock data: Ondo deep dive and provider comparison](https://app.notion.com/p/cownation/RWA-stock-data-Ondo-deep-dive-and-provider-comparison-4098da5f04ca811e89e2e0fcfb87f14c)
and [tokenizedstonks.io data sources](https://app.notion.com/p/cownation/tokenizedstonks-io-data-sources-reverse-engineered-40d8da5f04ca81208125eb393880dd86).

## Two markets, one asset

An asset page (for example NVDA) shows two different markets:

- **Stock market:** the share itself, NVDA on Nasdaq.
- **Tokenized stock market:** the issuer tokens (NVDAon, NVDAx, ...). CoinGecko's RWA API returns this market only:
  the price in `AssetStats` today is the tokenized price, not the stock price.

The stock market comes first. Ideally the page shows both.

## What the page shows

| Block | Data | Market |
|---|---|---|
| `AssetStats` (price, 24h change, market status) | toggle **[Stock / Tokenized stock]**, Stock by default | toggle |
| `AssetPriceChart` (line and candles, 1D / 1W / 1M / 1Y / ALL) | toggle | toggle |
| Overview → `AssetAbout`: ticker, sector, description, website | static, from `data/RWAs.json` | stock, always |
| Overview → stock card: market status (`allowedTradingTime`), company market cap, avg. volume, day range, 52-week range | dynamic | stock, always |
| Positions, open orders, activity | CoW services | tokens |

With Tokenized stock selected, `AssetStats` and `AssetPriceChart` keep today's CoinGecko behaviour.

Static data in `RWAs.json` (`allowedTradingTime`, `newsFeed`, `profile`) can be sourced from Massive's ticker reference
(`https://api.massive.com/v3/reference/tickers/{TICKER}`), with the description rewritten rather than copied verbatim.

## Provider abstraction

Stock data sits behind one interface, with providers tried in order:

1. **Ondo**: the only provider today.
2. **FinancialData.net**: planned fallback for assets Ondo does not cover. It is the first choice in the Notion
   comparison: $299/month Enterprise, display and redistribution included, US and international coverage.

## Ondo API

All requests are `GET` with the `x-api-key` header. Paths take the **Ondo token symbol** (`NVDAon`), not the
stock ticker. An asset without an Ondo token cannot be looked up.

| Endpoint | Use |
|---|---|
| `/v1/assets/{symbol}/prices/latest` | `underlyingMarket.price`: current stock price |
| `/v1/assets/{symbol}/market` | `underlyingMarket`: price, 52-week high/low, volume, average volume, shares outstanding, market cap |
| `/v1/assets/{symbol}/prices/ohlc?interval=&range=` | `underlyingMarket.data`: stock candles (`primaryMarket.data` holds the token candles) |
| `/v1/assets/all/market` | the same market data for every asset, about 3 MB (`ondoClient.ts` already uses it for shares multipliers) |
| `/v1/assets/all/metadata` | `ticker`, `underlyingName`, `isin`, `tags.sectorIndustry`, `coingeckoId`, contract addresses |
| `/v1/status/market` | Ondo Global Markets session (`premarket`, `regular`, `postmarket`, `overnight`), next open and close |

Ondo server caches: market snapshots 1 min, prices 1 s, metadata 5 min.

### `/market` response (NVDAon)

```json
"underlyingMarket": {
  "ticker": "NVDA",
  "name": "Nvidia Corp",
  "price": "198.251951",
  "priceHigh52w": "243.37",
  "priceLow52w": "164.27",
  "volume": "149033316.518682",
  "averageVolume": "154913179",
  "sharesOutstanding": "24147000000",
  "marketCap": "4832834234634"
}
```

Numbers are decimal strings. `primaryMarket` in the same response is the NVDAon token: price, 24h change,
`priceHistory24h`, holders, `sharesMultiplier`, tradable sessions.

### OHLC interval/range pairs

Only these pairs are accepted (anything else returns `400 INVALID_INTERVAL_RANGE_PAIR`):

`1min/1day`, `5min/1day`, `15min/1day`, `1hour/1month`, `4hour/1month`, `12hour/3month`, `1day/3month`,
`1day/6month`, `1day/1year`, `1day/all`

| Chart range | Request |
|---|---|
| 1D | `5min/1day` or `15min/1day` |
| 1W | `1hour/1month`, keep the last 7 days |
| 1M | `1hour/1month` or `4hour/1month` |
| 1Y | `1day/1year` |
| ALL | `1day/all` |

Candles have `timestamp` (ms), `open`, `high`, `low`, `close`, and **no volume**.

## How Ondo maps to the page

| Field | Source | Fit |
|---|---|---|
| Stock price | `underlyingMarket.price` | ✅ Live, and moves in premarket, postmarket and overnight sessions too |
| 24h change | none for the stock (`priceChangePct24h` is the token's) | 🟡 Calculate from the `15min/1day` stock candles |
| Chart | `underlyingMarket.data` from OHLC | ✅ |
| Company market cap | `underlyingMarket.marketCap` | ✅ ETFs need a fund label, not "Company market cap" |
| 52-week range | `priceLow52w`, `priceHigh52w` | ✅ |
| Avg. volume | `underlyingMarket.averageVolume` | 🟡 A **1-year** average. It does not match the "30d" label in the design, and candles have no volume to calculate 30 days ourselves |
| Day range | min/max of the `1day` candles | 🟡 A rolling 24 h including extended sessions, not the regular session |
| Sector | `tags.sectorIndustry` | 🟡 Broad (`["Technology"]`), and empty for about 100 of 482 Ondo assets. `RWAs.json` `profile.sector` stays the primary source |
| Description, website, news | none | ❌ Keep them in `RWAs.json` |
| US market open / closes in | `/v1/status/market` | 🟡 This is Ondo's trading session, not the exchange calendar. Keep `allowedTradingTime` for the US regular-session label |

## Limits and open questions

- **Coverage.** Only Ondo-supported assets: 482 in `/v1/assets/all/metadata`. In `RWAs.json`, **451 of 923** stock and
  index assets have an Ondo token. The other ~470 (xStocks-only, Reality-only, ...) have no stock data until a
  fallback provider is added.
- **History depth.** `1day/all` starts at Ondo's launch (2025-06-24 for NVDA), not at the stock's IPO. The first
  candles are flat (`open = high = low = close`).
- **Rights.** Ondo's terms neither grant nor forbid showing its stock data beside other issuers' tokens
  (xStocks, Reality, ...). The Notion page lists this as a question for Ondo, together with price and quotas.
- **Quotas.** The account has a request allowance (`429 RATE_LIMITED`), but no number is published.
- **Server only.** The key must never reach the browser: call Ondo from server code like
  `src/shared/api/ondo/ondoClient.ts` (`server-only`, `unstable_cache`, `withRetryBackoff`).

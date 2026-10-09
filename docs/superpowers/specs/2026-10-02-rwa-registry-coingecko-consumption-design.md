# RWA: CoinGecko consumption for a static, full-size registry

Date: 2026-10-02
App: `apps/rwa-frontend`
Related: `apps/rwa-frontend/scripts/updateRegistry.mjs` (builds `data/RWAs.json` from `/rwas/list`)

## Goal

`data/RWAs.json` is a static registry, rebuilt by hand with `update-registry`. With the full CoinGecko RWA list it holds
about 921 assets and 3,400 tokens. CoinGecko must be called only for the data the UI shows, and the assets table shows
10 assets per page.

Today every request to `/assets`, `/asset`, `/assets-search` and `/market-overview` loads market data for the whole
registry: `/coins/markets` for every token (~35 calls at full size) and GeckoTerminal per chain for every token (~115
calls). This happens because sorting and the market overview need values for every asset.

## Decisions

| Topic | Decision |
| --- | --- |
| Ranking source | CoinGecko `/rwas/markets` (`tokenized_market_data`), the only call that covers the whole registry: about 4 pages of 250, cached 60s |
| Scope of the figures | CoinGecko's tokenized market of each RWA: every chain and issuer, not only the registry tokens. Volume may include CEX trades |
| Registry key | Each asset gets a required `coingeckoId` (CoinGecko RWA id, e.g. `apple`), written by the script |
| Table columns | "24h DEX volume" becomes "24h volume", "Onchain market cap" becomes "Market cap". The same `/rwas/markets` values sort and display the rows |
| Page size | `ASSETS_PAGE_SIZE` = 10 |
| Per-token data | `/coins/markets` only for the assets of one asset page or network-stats request |
| Charts | Fetched only for the rows and overview items shown |
| Overview 7D chart | Σ over registry assets of (`market_cap / current_price`) × each `sparkline_in_7d.price` point, so supply is assumed constant |
| Asset page network stats | Stay onchain ("Onchain cap", "24h DEX vol"), priced with `/coins/markets` for that asset's tokens only |

## Data flow

### Provider

`MarketDataProvider` gets `getRwaMarkets(): Promise<Map<string, RwaMarketData>>`, keyed by the CoinGecko RWA id. It
fetches `/rwas/markets?per_page=250&page=N&sparkline=true` until a page has fewer than 250 items, with a 60s
revalidation. Every route makes the same request, so they share one cached upstream response.

`coingeckoClient.ts` gets `fetchRwaMarkets(revalidateSeconds)` for the raw response. Each item maps to:

| `RwaMarketData` field | `/rwas/markets` field |
| --- | --- |
| `price` | `tokenized_market_data.current_price` |
| `change24h` | `tokenized_market_data.price_change_percentage_24h` |
| `dayLow` / `dayHigh` | `low_24h` / `high_24h` |
| `marketCap` | `market_cap` |
| `volume24h` | `total_volume` |
| `updatedAt` | `last_updated` |
| `logoUrl` (new) | `image` |
| `sparkline7d` (new, server-only) | `sparkline_in_7d.price` |

`RwaMarketData.tokens` (per-token price, cap, volume, logo) is filled only where per-token data is loaded: on
`/asset/{ticker}`. Elsewhere it is `{}`.

`sparkline7d` is used only by the overview aggregation and is not sent in API responses.

Removed from the provider: `getPriceHistory`, and `getMarketData` for the whole registry. `getMarketData(assets)` stays
for one asset's tokens.

### Routes

| Route | Registry use | CoinGecko calls |
| --- | --- | --- |
| `/assets` | Filter the static registry, sort by `getRwaMarkets()` values, paginate | `getRwaMarkets()`, plus a 1D chart for each row on the page |
| `/assets-search` | `searchAssets` on the registry, then the `getRwaMarkets()` values | `getRwaMarkets()` |
| `/asset/{ticker}` | One asset | `getRwaMarkets()`, plus `/coins/markets` for its tokens |
| `/network-stats/{ticker}` | One asset, one chain | `/coins/markets` for the asset's tokens, plus GeckoTerminal for its tokens on that chain |
| `/market-overview` | All registry assets | `getRwaMarkets()`, plus charts for the 3 most traded and 6 movers |
| `/quotes`, `/chart`, `/token-list` | Unchanged | Unchanged |

Assets whose `coingeckoId` is missing from `/rwas/markets` get `market: null`.

### Assets list

`listAssets` does this:

1. `filterAssets(registry, filter)`.
2. Attaches `market` and `logoUrl` from `getRwaMarkets()` to each match.
3. `sortAssets`, then `paginate`.
4. Loads the 1D chart (`getChart(asset, '1D')`) for the page items only.

`RwaAssetListItem` keeps `market`, `logoUrl` and `series`, and loses `onchainCap` and `dexVolume24h`.

`RWA_SORT_FIELDS` becomes `priority`, `marketCap`, `volume24h`, `change24h`, `price`, `ticker`, `title`:
`onchainCap` and `dexVolume24h` are removed, and `volume24h` reads `market.volume24h`. The `/assets` handler's
doc comment is updated to match.

### Market overview

`getMarketOverview` works from `getRwaMarkets()` and the registry:

| Output | Rule |
| --- | --- |
| `totals.marketCap` | Σ `market.marketCap` over registry assets |
| `totals.volume24h` | Σ `market.volume24h` over registry assets |
| `totals.marketCapSeries` | The 7D formula above. Sparklines are hourly but differ in length: most have 169 points, newer assets fewer, ~80 none. So points are aligned from the end, with the last point at `updatedAt` and point `i` from the end at `updatedAt − i h`, rounded to the hour. An asset counts only in the hours its sparkline covers. The series spans the longest sparkline. Assets with no price or an empty sparkline are skipped |
| `mostTraded` | Top 3 by `volume24h`, excluding `0`/`null`. The series is the hourly DEX volume (Pro OHLCV) of those 3 assets only |
| `gainers` / `losers` | Unchanged rules on `change24h`. The series is the 1D chart of those items only |
| `updatedAt` | Latest `updatedAt` |

`RwaMarketOverviewTotals` becomes `{ marketCap, volume24h, marketCapSeries }`, and `RwaMarketOverviewItem.dexVolume24h`
becomes `volume24h`.

Removed: `aggregateNetworkStats`, `buildOnchainCapSeries`, `loadRegistryNetworkStats`, the `ChainNetworkStats` type, and
the registry-wide `groupByChain` use.

### Portfolio

`portfolioMarketsQueryAtom` requests `/assets?tickers=<held tickers>&pageSize=100` instead of page 1 of 100 by
priority. The held tickers come from the balances positions. With no positions there is no request. `getLogoUrl` returns the
asset `logoUrl` from the list item for both the asset and its tokens, because `market.tokens` is empty there. Token rows
in the holdings table therefore show the asset logo instead of the per-issuer token logo.

## UI changes

| Place | Change |
| --- | --- |
| `AssetsTable` | Columns "24h volume" (`volume24h`) and "Market cap" (`marketCap`), reading `asset.market` |
| `MarketTotalsCard` | "Market cap" and "24h volume", series `marketCapSeries` |
| `MostTradedCard` | Subtitle "24h volume · All networks", value `volume24h` |
| `assetsSortAtom` | Key `rwaAssetsSort:v3`, default `{ sort: 'volume24h', order: 'desc' }` |
| `assetsPageAtom` | `ASSETS_PAGE_SIZE = 10` |
| `persistQueryCache.ts` | `STORE_NAME = 'queryCache:v5'`, with `queryCache:v4` added to `PREVIOUS_STORE_NAMES` |
| `HeaderSearch` | The logo comes from `item.logoUrl` (RWA image) |

## Registry and script

- `RwaAsset.coingeckoId: string` is required. `validateRegistry` rejects an empty or duplicate one.
- `updateRegistry.mjs` writes `coingeckoId: rwa.id` for each asset.
- Market lookups use `asset.coingeckoId` as the key into `getRwaMarkets()`. `registry.ts` gets no new lookup.
- The last step regenerates `data/RWAs.json` with the script and commits the full registry.

## Error handling

- If `/rwas/markets` fails, every route that depends on it returns `degraded: true` with `market: null`. The table
  sorts nulls last, then by ticker (current `sortAssets` behaviour). Overview totals and series are `null`, so the UI
  shows `—`, and the lists are empty.
- Per-row chart failures leave that row's `series` as `null` (current behaviour).
- `/asset/{ticker}` stays usable if `/coins/markets` fails: the headline comes from `/rwas/markets`, and the token
  table shows dashes.

## Testing

- Service tests mock the registry module instead of reading the real `RWAs.json`. Only `validateRegistry.test.ts`
  reads the real file. This fixes the tests that hard-code the registry's issuers and chains.
- `listAssets`:
  - sorts by `volume24h`, `marketCap`, `price` and `change24h` from `getRwaMarkets()` values;
  - never calls `getMarketData` or `getNetworkStats`;
  - calls `getChart` once per page item.
- `getMarketOverview`: totals, `marketCapSeries` from sparklines of different lengths (end-aligned, skipping assets
  without a price or sparkline), most traded,
  movers, and the degraded path when `getRwaMarkets()` fails.
- `getAssetNetworkStats` calls `getMarketData` with that asset only.
- `coingeckoProvider.getRwaMarkets` paginates until a short page and maps the fields above.
- `validateRegistry` rejects a missing or duplicate `coingeckoId`.
- UI tests: the renamed labels, and 10 rows per page.

## Out of scope

- The portfolio streams balances for every registry token from the balances watcher (~3,400 tokens at full size).
- Commodities (gold, silver) stay out of the registry.
- `/token-list` stays the full registry token list.

# CoW RWA (`@cowprotocol/rwa-frontend`)

CoW RWA is the CoW Swap app for tokenized real-world assets: stocks, ETFs and commodities that several issuers
(Ondo, xStocks, bStocks, Robinhood, Paxos, Tether and others) put onchain. It is served at
[swap.cow.fi/rwa](https://swap.cow.fi/rwa).

One asset, such as NVIDIA or Gold, often has many tokens: one per issuer and network. The app groups them under the
asset, so a user can:

- browse and filter every asset, with its price, 24h change, market cap and volume (home page);
- open an asset page with the price chart (stock or tokenized market), the issuers and networks it trades on, quotes
  for every token, the company profile and the issuer's news;
- buy or sell any of its tokens with the embedded CoW Swap widget;
- see their holdings, equivalent shares and order activity on the portfolio page.

The app is a Next.js (App Router) app in the CoW Swap monorepo. It has no backend of its own: its server routes read
the asset registry (`data/RWAs.json`) and combine it with CoinGecko, Ondo, the CoW order book and onchain data.

## Getting started

From the repository root:

```bash
pnpm install
pnpm start:rwa          # http://localhost:3002/rwa
```

| Task                   | Command                                                         |
| ---------------------- | --------------------------------------------------------------- |
| Build                  | `pnpm build:rwa`                                                |
| Lint (FSD check first) | `pnpx nx run rwa-frontend:lint`                                 |
| Unit tests (Jest)      | `pnpx nx run rwa-frontend:test`                                 |
| Browser tests          | `pnpm e2e:rwa` (Playwright, `apps/cowswap-e2e-tests/src/rwa`)   |
| Typecheck              | `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit` |
| Registry script tests  | `pnpm --filter @cowprotocol/rwa-frontend test-scripts`          |

The app runs without any API key, on keyless public APIs that are heavily rate limited. Put keys in
`apps/rwa-frontend/.env`; the most useful ones are `COINGECKO_API_KEY` (with `COINGECKO_API_PLAN=pro` for the Pro
API), `ONDO_API_KEY` (stock market data and Ondo share multipliers) and `COW_API_KEY` (quotes). Every variable is
listed in [`AGENTS.md`](./AGENTS.md#environment).

In development the trade widget loads the local CoW Swap (`pnpm start:cowswap`, `http://localhost:3000`), so start
it too when you work on trading.

## Project structure

```
apps/rwa-frontend/
├── app/        Next.js routing only: pages and API routes, each re-exporting from src/
├── src/        Application code, Feature-Sliced Design layers
├── data/       RWAs.json, the asset registry
├── scripts/    Registry maintenance scripts (update, validate, profiles, websites)
├── docs/       Design notes: market data, CoinGecko usage, issuer dividends, analytics
├── public/     Static files and the service worker
└── jest/       Jest polyfills and mocks
```

### Routes (`app/`)

Every file under `app/` only re-exports a handler or a page from `src/_app` or `src/_pages`.

**Web pages**

| Route             | Page                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `/`               | Home: market overview (totals, most traded, top movers) and the asset table |
| `/asset/[ticker]` | Asset page: chart, stats, tokens, quotes, trade widget, profile, news       |
| `/portfolio`      | Holdings and order activity of the connected wallet                         |

Home and asset pages are ISR: they are rendered on the server with their market data, then cached.

**HTTP API (`/api/v1/...`)**, used by the pages and cached by Next.js:

| Endpoint               | Returns                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `assets`               | Paged, sorted and filtered assets with market data                           |
| `assets-search`        | Search by ticker, title, token symbol or description, typo tolerant          |
| `asset/[ticker]`       | One asset with the market of each of its tokens and the next trading pause   |
| `market-overview`      | Registry-wide totals, most traded assets and top movers                      |
| `chart/[ticker]`       | Price chart (`range`, `market=stock\|tokenized`)                             |
| `candles/[ticker]`     | OHLC candles (`range`, `market=stock\|tokenized`)                            |
| `stock/[ticker]`       | Stock market of the underlying share, when a provider covers it (Ondo today) |
| `quotes/[ticker]`      | CoW quotes of every asset token on a network, for 1000 USDC                  |
| `token-stats/[ticker]` | DEX volume of every asset token on every network                             |
| `news/[ticker]`        | Latest press releases from the issuer's RSS/Atom feed                        |
| `token-list`           | The registry as a token list, for the balances watcher                       |

Plus SEO and PWA routes: `sitemap.xml`, `llms.txt`, `manifest`, `icons/[size]`, `og-image` and
`asset/[ticker]/og-image`.

### Source layers (`src/`)

The code follows [Feature-Sliced Design](https://feature-sliced.design/docs/guides/tech/with-nextjs), checked by
steiger. A layer imports only from the layers below it, and other slices only through their `index.ts` (server-only
code through `index.server.ts`).

| Layer            | Contents                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `_app`           | App shell: root layout, providers, wallet (Reown + wagmi), API route handlers, query cache persistence (IndexedDB), Sentry, analytics, SEO    |
| `_pages`         | `home`, `asset`, `portfolio`, `not-found`                                                                                                     |
| `widgets`        | `header` (navigation, search, wallet) and `account` (balances, positions, activity)                                                           |
| `features`       | `connect-wallet`                                                                                                                              |
| `entities/asset` | The core domain: registry access, asset types, market data service, issuers, dividend models, shares per token, charts, US market hours       |
| `shared`         | `api` (clients for CoinGecko, Ondo, xStocks, CoW order book, balances watcher, news feeds, ERC-20/4626/8056 contracts), `config`, `lib`, `ui` |

Market data always goes through `entities/asset/api/assetsService.ts`; routes and UI never call a provider directly.
Client data fetching uses Jotai with `jotai-tanstack-query`.

### Docs (`docs/`)

- [`market-metrics.md`](./docs/market-metrics.md): what each price, change and volume figure means and where it comes from
- [`stock-market-data.md`](./docs/stock-market-data.md): the Stock / Tokenized stock views and their providers
- [`coingecko-api-consumption.md`](./docs/coingecko-api-consumption.md) and
  [`coingecko-data-flow.puml`](./docs/coingecko-data-flow.puml): CoinGecko endpoints, caching and usage estimates
- [`issuer-dividends.md`](./docs/issuer-dividends.md): how each issuer passes dividends on, and the share multipliers
- [`analytics.md`](./docs/analytics.md): GTM events

[`AGENTS.md`](./AGENTS.md) holds the detailed app rules (caching, networks, widget environments, styling and so on).

## The asset registry (`data/RWAs.json`)

The registry is the list of every asset the app knows and every token of it. It is a static JSON file, bundled into the
server at build time: a change ships with the next deploy.

### Format

```jsonc
{
  "version": "0.1.22", // bumped by update-registry on every change
  "lastModificationTime": "2026-11-11T11:28:22.905Z",
  "allowedTradingTimes": {
    // shared values, referenced by key
    "0": { "title": "US market open", "start": "09:30", "end": "16:00", "timeZone": "America/New_York" },
  },
  "sectors": {
    // shared values, referenced by key
    "190": "Information Technology · Semiconductors",
  },
  "assets": [
    {
      "ticker": "NVDA", // unique, upper case: the /asset/NVDA URL
      "coingeckoId": "nvidia", // unique CoinGecko RWA id, the key of its market data
      "title": "NVIDIA",
      "logoUrl": "https://coin-images.coingecko.com/...", // optional, https
      "type": "stock", // stock | index (ETF) | commodity
      "priority": 9, // 0..10, higher goes first in the default sorting
      "allowedTradingTime": 0, // key in allowedTradingTimes; omitted for 24/7 assets (commodities)
      "newsFeed": {
        // optional, hand-edited
        "source": "NVIDIA Newsroom",
        "url": "https://nvidianews.nvidia.com/releases.xml",
      },
      "profile": {
        // optional: the About section of the asset page
        "description": "NVIDIA designs graphics processors and computing platforms for AI, ...",
        "sector": 190, // key in sectors
        "website": "https://www.nvidia.com", // optional
      },
      "tokens": [
        // at least one; largest token market cap first
        {
          "chainId": 1,
          "address": "0xc845b2894dBddd03858fd2D643B4eF725fE0849d",
          "symbol": "NVDAx",
          "name": "NVIDIA xStock",
          "decimals": 18,
          "issuer": "xStocks", // the issuer name used by every issuer rule
          "coingeckoId": "nvidia-xstock", // optional CoinGecko coin id of the token
        },
      ],
    },
  ],
}
```

The types are in [`src/entities/asset/model/types.ts`](./src/entities/asset/model/types.ts) (`RwaRegistry`,
`RwaAsset`, `RwaToken`).

**Shared value maps.** Trading times and sectors repeat across hundreds of assets, so each distinct value is stored
once in `allowedTradingTimes` or `sectors`, and assets reference it by its number key. The app resolves the keys when
it loads the file (`decodeRegistry` in `registryFile.ts`); the scripts read and write it through
`scripts/registryFile.mjs`, which keeps existing keys, numbers new values after the highest key and drops unused ones,
so keys can have gaps.

**What the app does with it** (`entities/asset/model/registry.ts`):

- The listings (home, search, asset pages, sitemap) show only tokens on the networks the app trades on
  (`RWA_CHAIN_IDS` in `entities/asset/model/networks.ts`), and leave out assets without any such token. The registry
  itself keeps tokens on every CoW-supported network.
- Holdings, the portfolio and `/api/v1/token-list` use the full registry, so a token on another network is still
  valued in a wallet.
- Market data is looked up by `coingeckoId`: the asset one for the aggregated tokenized market (`/rwas/markets`), the
  token one for per-token prices.

**Validation.** `validateRegistry` (`entities/asset/model/validateRegistry.ts`) checks unique tickers and CoinGecko
ids, upper-case tickers, types, priority range, trading time format, https URLs, profile rules (description and
`Sector · Industry` format), supported chain ids, addresses and decimals. It runs in
`validateRegistry.test.ts`, in the `validate-registry` script, and before every write of the update scripts.

### How the registry is maintained

The registry is generated from the [CoinGecko RWA API](https://docs.coingecko.com/reference/rwa-overview), then
enriched. The scripts are run by hand and the result is reviewed and committed like code:

| Step | Command (`pnpm --filter @cowprotocol/rwa-frontend ...`) | What it does                                                                                                                                                                |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `update-registry` (needs `COINGECKO_API_KEY`)           | Rebuilds the asset and token lists from CoinGecko: every RWA of type stock, ETF or commodity with a token on a CoW-supported network, assets sorted by tokenized market cap |
| 2    | `update-profiles` (needs `ANTHROPIC_API_KEY`)           | Writes `profile.description` and `profile.sector` from Wikipedia/Wikidata, reworded by Claude. Flags: `--source wikipedia\|ai`, `--force`, `--ticker NVDA`, `--dry-run`     |
| 3    | `update-websites`                                       | Writes `profile.website` from Wikidata. Flags: `--force`, `--ticker NVDA`, `--dry-run`                                                                                      |
| -    | `validate-registry`                                     | Validates the file; run it after every hand edit                                                                                                                            |

`update-registry` **replaces** the asset and token lists with what CoinGecko returns, but keeps these hand-edited
fields of assets and tokens already in the file:

- asset: `title`, `priority`, `allowedTradingTime`, `newsFeed`, `profile`;
- token: `symbol`, `name`, `issuer`.

Everything else (`logoUrl`, `type`, `decimals`, the order of assets and tokens, and which assets and tokens exist) is
rewritten. A new issuer appears with its CoinGecko name and no dividend model or legal link: see
[Adding or updating an issuer](./AGENTS.md#adding-or-updating-an-issuer).

### Adding an asset by hand

**Prefer CoinGecko.** If the asset or token is listed in the CoinGecko RWA API, run `update-registry` instead: it
fills every field, and anything added by hand that CoinGecko doesn't list is **removed on the next run**. Add an asset
by hand only when it can't wait for that, and check after the next `update-registry` that it is still there.

1. **Check the asset isn't there already.** Search `data/RWAs.json` for the ticker and the CoinGecko id. If the asset
   exists and only a token is missing, add the token to its `tokens` (step 4) and skip to step 6.

2. **Find the CoinGecko ids.** The asset `coingeckoId` is the RWA id (the `id` in CoinGecko
   `/rwas/list`); the token `coingeckoId` is the coin id from its coingecko.com page.
   Without them the asset is listed but has no price, chart or market data.

3. **Add the asset** to the `assets` array, next to assets of a similar market cap (`update-registry` sorts them
   anyway):

   ```json
   {
     "ticker": "ACME",
     "coingeckoId": "acme-corp",
     "title": "Acme Corp",
     "logoUrl": "https://coin-images.coingecko.com/coins/images/.../large/acme.png",
     "type": "stock",
     "priority": 0,
     "allowedTradingTime": 0,
     "tokens": []
   }
   ```

   - `ticker`: upper-case letters, digits and dots, unique in the file. It becomes the page URL (`/rwa/asset/ACME`).
   - `type`: `stock`, `index` for an ETF, or `commodity`.
   - `priority`: `0` unless the asset should rank higher in the default sorting (up to `10`).
   - `allowedTradingTime`: the key of the US market hours in `allowedTradingTimes` (`0`) for stocks and ETFs. Leave
     it out for assets that trade around the clock, like commodities. For other hours, add an entry to
     `allowedTradingTimes` with the next free number key (`start`/`end` as `HH:mm` in an IANA `timeZone`).
   - `logoUrl`: optional, `https` only.

4. **Add a token per issuer and network** to `tokens`, the token with the largest market cap first (the chart falls
   back to the first token with prices):

   ```json
   {
     "chainId": 1,
     "address": "0x...",
     "symbol": "ACMEx",
     "name": "Acme Corp xStock",
     "decimals": 18,
     "issuer": "xStocks",
     "coingeckoId": "acme-corp-xstock"
   }
   ```

   - `chainId`: a network CoW Protocol supports. The asset is listed only when at least one of its tokens is on an
     `RWA_CHAIN_IDS` network (Ethereum, BNB, Base, Arbitrum, Polygon, Avalanche, Plasma, Ink, Gnosis).
   - `address`: the checksummed contract address. Read `decimals` from the contract, not from an explorer label.
   - `issuer`: exactly the name used by the other tokens of that issuer (`Ondo`, `xStocks`, `bStocks`...), since the
     legal link, dividend model and share multiplier are keyed by it. A new issuer needs the setup in
     [Adding or updating an issuer](./AGENTS.md#adding-or-updating-an-issuer).

5. **Optionally add a profile and a news feed.**
   - `profile`: run `pnpm --filter @cowprotocol/rwa-frontend update-profiles --ticker ACME`, then `update-websites
--ticker ACME`, or write it by hand: a one or two sentence factual `description` without figures, and `sector` as
     the key of a `sectors` entry. For a sector that isn't in the map, add `"<next key>": "<Sector> · <Industry>"`,
     where `<Sector>` is one of `RWA_SECTORS` (`entities/asset/model/sectors.ts`: the GICS sectors, or `ETF`).
   - `newsFeed`: `{ "source": "Acme Newsroom", "url": "https://..." }`, an RSS or Atom feed on the issuer's own
     domain, never an aggregator. Check that it answers XML to a non-browser client
     (`curl -sA 'rwa-check' <url> | head`): many IR sites block bots, and the asset page hides news when the feed fails.

6. **Validate and test:**

   ```bash
   pnpm --filter @cowprotocol/rwa-frontend validate-registry
   pnpx nx run rwa-frontend:test --testPathPattern=validateRegistry
   ```

7. **Check it in the app** (`pnpm start:rwa`): the asset shows up in the home table and search,
   `/rwa/asset/ACME` shows its price and tokens, and the trade widget offers its tokens.

Geoblocking is not set in this app: the CoW Swap widget enforces it from its restricted token lists in
`libs/core/src/cms`, so tokens of a new issuer must be added there too (see the `rwa-token-list-onboarding` skill).

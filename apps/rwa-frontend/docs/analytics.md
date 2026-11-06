# Analytics (rwa-frontend)

The app loads the CoW Swap Google Tag Manager container (`GTM_ID` = `GTM-TBX4BV5M`, from
`@cowprotocol/common-const/analytics`, the ID `initGtm` uses in CoW Swap) and pushes events to `window.dataLayer`.
GA4 tags and triggers are configured in GTM: an event below reaches Google Analytics only once the container has a
tag for it. The app is served at `swap.cow.fi/rwa`, so filter RWA traffic by page path (`/rwa/...`).

## Code

- `src/shared/lib/analytics`: `loadGtm()`, `trackEvent(name, params)` and `setAnalyticsDimension()`. Every event and
  its params are typed in `events.ts` (`RwaAnalyticsEvents`): add a new event there and to this page.
- `src/_app/analytics/Analytics.tsx`: loads GTM, sends page views and the wallet events.
- `src/_pages/asset/model/useWidgetOrderAnalytics.ts`: order events from the trade widget.

The `@cowprotocol/analytics` lib isn't used: its root entry imports Lingui macros (which Turbopack doesn't run), Sentry
and `react-router`. The data layer format is the same: event params are flat, and every event carries the
dimensions CoW Swap sends.

Run `window.dataLayer` in the browser console to see the pushed events, or use GTM preview mode.

## Dimensions

Sent with every event once known, as in CoW Swap:

| Param | Value |
|---|---|
| `dimension_chainId` | Wallet network id, e.g. `1` |
| `dimension_userAddress` | Connected address, `disconnected` without a wallet |
| `dimension_walletName` | Wallet connector name, e.g. `MetaMask`, `WalletConnect` |

## Events

### Navigation and wallet

| Event | When | Params |
|---|---|---|
| `page_view` | Every route change, and the first page load | `page_path` (with `/rwa`), `page_title` |
| `connect_wallet_click` | **Connect wallet** clicked | `variant`: `primary` (header, wallet bar, account tabs) or `secondary` (trade widget and portfolio prompts) |
| `wallet_connected` | A wallet connects, including the automatic reconnection on page load | `walletAddress`, `walletName` |
| `wallet_switched` | The connected account changes | `walletAddress`, `walletName`, `previousWalletAddress`, `previousWalletName` |
| `wallet_disconnected` | The wallet disconnects | `previousWalletAddress`, `previousWalletName` |

The wallet events use the CoW Swap names and params, so the existing GTM tags pick them up.

### Discovery (home page and search)

| Event | When | Params |
|---|---|---|
| `search_asset_select` | An asset picked in the header search | `ticker`, `search_term` (the typed query) |
| `watchlist_toggle` | Star clicked in the assets table | `ticker`, `isWatched` (`true` when added) |
| `assets_filter_change` | Type tab, watchlist toggle or a filter panel change (also **Reset**) | `changed` (comma-separated filter keys: `type`, `issuers`, `chainIds`, `minMarketCap`, `minVolume24h`, `watchlistOnly`) and the resulting filters: `type`, `issuers` and `chainIds` (comma-separated), `minMarketCap` and `minVolume24h` (USD), `watchlistOnly`. Unset filters are left out |

### Asset page

| Event | When | Params |
|---|---|---|
| `trade_side_select` | **Buy** / **Sell** toggle above the widget, or Buy / Sell in the mobile wallet bar | `ticker`, `side` (`buy`, `sell`), `placement` (`trade_widget`, `wallet_bar`) |
| `trade_token_select` | A token picked in the token selector above the widget, or Buy / Sell in the **Stock tokens** table | `ticker`, `issuer`, `chainId`, `side`, `placement` (`trade_widget`, `stock_tokens`) |
| `trade_network_select` | Network picked in the token selector | `ticker`, `chainId` |
| `market_kind_select` | **Stock** / **Tokenized stock** toggle | `ticker`, `marketKind` (`stock`, `tokenized`) |
| `chart_range_select` | Chart range picked | `range` (`1D`, `1W`, `1M`, `1Y`, `ALL`) |
| `chart_type_select` | Line / candles toggle | `chartType` (`line`, `candles`) |
| `news_article_click` | An issuer news article opened | `ticker`, `source` (the feed name) |

### Orders

The trade widget is CoW Swap in an iframe, which sends no analytics in widget mode. The app forwards the widget order
events under the CoW Swap event names:

| Event | Widget event | Params |
|---|---|---|
| `order_submitted` | `ON_POSTED_ORDER` | common params, plus `side` (`buy` when the bought token is a token of the asset), `kind` (`sell`, `buy`), `sellAmountUnits`, `buyAmountUnits` (decimal amounts) |
| `swap_executed` | `ON_FULFILLED_ORDER` | common params, plus `executedSellAmount`, `executedBuyAmount` (atoms) |
| `swap_cancelled` | `ON_CANCELLED_ORDER` | common params |
| `swap_expired` | `ON_EXPIRED_ORDER` | common params |

Common params: `ticker` (the asset page), `orderId`, `chainId`, `orderType` (`SWAP`, `LIMIT`, `TWAP`), `walletAddress`,
`sellToken`, `buyToken` (addresses), and, when known, `sellTokenSymbol`, `buyTokenSymbol`, `isEoaTwap`.

The widget reports fulfilment, cancellation and expiry only while the asset page is open.

### Account

| Event | When | Params |
|---|---|---|
| `order_cancel` | An order cancelled from the open orders table (asset page or portfolio) ends | `chainId`, `cancellationType` (`soft`, `hard`), `result` (`cancelled`, `rejected` by the user, `failed`) |
| `portfolio_refresh` | **Refresh** clicked on the portfolio balances | none |

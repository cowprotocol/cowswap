# Analytics (rwa-frontend)

The app loads the CoW Swap Google Tag Manager container (`GTM_ID` = `GTM-TBX4BV5M`, from
`@cowprotocol/common-const/analytics`, the ID `initGtm` uses in CoW Swap) and pushes events to `window.dataLayer`.
GA4 tags and triggers are configured in GTM: an event below reaches Google Analytics only once the container has a
tag for it, and a param only once the container has a variable for it. The app is served at `swap.cow.fi/rwa`, so
filter RWA traffic by page path (`/rwa/...`).

## GTM container

What the published container (version 64) does with these events:

- Tagged: `wallet_connected`, `order_submitted`, `swap_executed`, `swap_cancelled`, `swap_expired`.
- No trigger: `page_view`, `set_user_account`, `wallet_switched`, `wallet_disconnected`, and every RWA-only event
  (discovery, asset page, account).
- No variable for `ticker` or `side`, so they don't reach GA even on the tagged order events. Until the container
  has them, RWA orders can only be told apart by page path.
- GA page views come from a tag on `gtm.historyChange`, not from the pushed `page_view`.

Container work this needs: `ticker` and `side` variables, and tags for the events above that have no trigger.

## Code

- `src/shared/lib/analytics`: `loadGtm()`, `trackEvent(name, params)` and `setAnalyticsDimension()`. Every event and
  its params are typed in `events.ts` (`RwaAnalyticsEvents`): add a new event there and to this page.
- `src/_app/analytics/Analytics.tsx`: loads GTM, sends page views and the wallet events.
- `src/_pages/asset/model/useWidgetOrderAnalytics.ts`: order events from the trade widget.

The `@cowprotocol/analytics` root entry isn't used: it imports Lingui macros (which Turbopack doesn't run), Sentry and
`react-router`. The order event payloads come from its side-effect-free `@cowprotocol/analytics/order-lifecycle`
subpath, the same mappers CoW Swap uses. The data layer format is the same: event params are flat, and every event
carries the dimensions CoW Swap sends.

Run `window.dataLayer` in the browser console to see the pushed events, or use GTM preview mode.

## Dimensions

Sent with every event once known, as in CoW Swap:

| Param | Value |
|---|---|
| `dimension_chainId` | Wallet network id, e.g. `1` |
| `dimension_userAddress` | Connected address, `disconnected` without a wallet |
| `dimension_walletName` | Wallet connector name, e.g. `MetaMask`, `WalletConnect`, `Not connected` without a wallet |

## Events

### Navigation and wallet

| Event | When | Params |
|---|---|---|
| `page_view` | Every route change, and the first page load | `page_path` (with `/rwa`) |
| `connect_wallet_click` | **Connect wallet** clicked | `variant`: `primary` (header, wallet bar, account tabs) or `secondary` (trade widget and portfolio prompts) |
| `set_user_account` | The wallet state settles (page load, connect, switch, disconnect) | `userId` (connected address, left out without a wallet) |
| `wallet_connected` | A wallet connects, including the automatic reconnection on page load | `eventType` (`wallet_initial_connection`), `walletAddress`, `walletName` |
| `wallet_switched` | The connected account changes | `eventType` (`wallet_switch`), `walletAddress`, `walletName`, `previousWalletAddress`, `previousWalletName` |
| `wallet_disconnected` | The wallet disconnects | `eventType` (`wallet_disconnection`), `previousWalletAddress`, `previousWalletName` |

The wallet events use the CoW Swap names and params (`CowAnalyticsGtm.setUserAccount`). Only `wallet_connected` has a
tag in the container (see [GTM container](#gtm-container)).

### Discovery (home page and search)

| Event | When | Params |
|---|---|---|
| `search_asset_select` | An asset picked in the header search | `ticker`, `search_term` (the typed query) |
| `watchlist_toggle` | Star clicked in the assets table | `ticker`, `isWatched` (`true` when added) |
| `assets_filter_change` | Type tab, watchlist toggle or a filter panel change (also **Reset**) | `changed` (comma-separated filter keys: `type`, `issuers`, `chainIds`, `minMarketCap`, `minVolume24h`, `watchlistOnly`) and the resulting filters: `type`, `issuers` and `chainIds` (comma-separated), `minMarketCap` and `minVolume24h` (USD), `watchlistOnly`. Unset filters are `null`, so GTM doesn't keep the previous value |

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
events with the payloads CoW Swap sends (`mapPostedOrder`, `mapFulfilledOrder`, `mapCancelledOrder`,
`mapExpiredOrder` from `@cowprotocol/analytics/order-lifecycle`), plus `ticker`:

| Event | Widget event | RWA params |
|---|---|---|
| `order_submitted` | `ON_POSTED_ORDER` | `ticker` (the asset page), `side` (`sell` when the sold token is a token of the asset, `buy` otherwise) |
| `swap_executed` | `ON_FULFILLED_ORDER` | `ticker` (the traded asset, see below) |
| `swap_cancelled` | `ON_CANCELLED_ORDER` | `ticker` (the traded asset, see below) |
| `swap_expired` | `ON_EXPIRED_ORDER` | `ticker` (the traded asset, see below) |

The CoW Swap params include `orderId`, `chainId` (a string), `orderType`, `walletAddress`, `sellToken`, `buyToken`,
amounts in atoms (`sellAmount`, `buyAmount`) and in units (`sellAmountUnits`, `buyAmountUnits`), and the Safary
aliases `fromCurrency`, `toCurrency`, `fromAmount`, `toAmount`; `swap_executed` adds the executed amounts
(`executedSellAmountUnits`, ...). See `libs/analytics/src/widget/orderLifecyclePayloads.ts` for the full list.

`side` reads the sold token because it is always on the order's `chainId`; on a bridged buy the bought token is on the
destination chain.

The widget reports fulfilment, cancellation and expiry only while an asset page is open, but for every order of the
account on that network: an AAPL limit order can fill on the TSLA page, and so can an order placed in CoW Swap. So
`ticker` is the open asset's ticker only when the order sells or buys one of its tokens on the order's network, or
bridges to one (`bridgeOrder` on `swap_executed`), and `null` otherwise. A cancelled or expired bridged buy carries
no bridge data, so its `ticker` is `null`.

### Account

| Event | When | Params |
|---|---|---|
| `order_cancel` | An order cancelled from the open orders table (asset page or portfolio) ends | `chainId`, `cancellationType` (`soft`, `hard`), `result` (`cancelled`, `rejected` by the user, `failed`) |
| `portfolio_refresh` | **Refresh** clicked on the portfolio balances | none |

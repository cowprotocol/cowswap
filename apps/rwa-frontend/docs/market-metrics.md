# Market metrics on CoW RWA

Where each market value on the **Explore** page and the **asset page** comes from, how it is calculated, and why the same value can differ between the two pages.

Checked on 2026-11-09. The examples use SanDisk (SNDK).

## Data sources

All CoinGecko links below open in a browser without an API key, except source C, which needs a paid key.

| # | Source | What it holds | Example link | Refreshed every |
|---|---|---|---|---|
| A | CoinGecko RWA markets | One row per asset (e.g. SanDisk), combined over every issuer and network | [`/rwas/markets`](https://api.coingecko.com/api/v3/rwas/markets?per_page=250&page=1&sparkline=true) | 3 min |
| B | CoinGecko coin markets | One row per issuer token (e.g. SanDisk Ondo, SanDisk xStocks) | [`/coins/markets`](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=sandisk-ondo-tokenized,sandisk-corporation-xstock,sandisk-bstocks-tokenized-stock,sandisk-rstock,sandisk-coinbase-tokenized-stock) | 1 min |
| C | CoinGecko RWA price chart | Price history of the asset, combined over every issuer and network | [1 day](https://api.coingecko.com/api/v3/rwas/sandisk/market_chart?vs_currency=usd&days=1), [1 year](https://api.coingecko.com/api/v3/rwas/sandisk/market_chart?vs_currency=usd&days=365) (paid key only) | 1 day: 15 min, 1 year: 1 h |
| D | GeckoTerminal (CoinGecko's onchain data) | DEX trading of one token on one network | [SNDKON on Ethereum](https://api.geckoterminal.com/api/v2/networks/eth/tokens/multi/0x71E2400CF1Cb83204f33794eD326636A71a9AAfC) | 5 min |
| E | Ondo (not CoinGecko, needs a key) | The real stock on its exchange | – | 1 min |

In source A, the values are under `tokenized_market_data`:

- `current_price`
- `price_change_percentage_24h`
- `low_24h` and `high_24h`
- `market_cap`
- `total_volume`
- `sparkline_in_7d` (hourly prices of the last 7 days)

Source C needs CoinGecko's paid plan. A deployment without it (for example a test deployment) charts **one issuer token** instead: the first one in our list that has prices, e.g. the bStocks token for SanDisk ([1 day](https://api.coingecko.com/api/v3/coins/sandisk-bstocks-tokenized-stock/market_chart?vs_currency=usd&days=1)). Its chart and ranges then differ slightly from production.

CoinGecko's API has no stock price. The stock price, the company's market cap and the exchange volume come from Ondo, and only for assets that have an Ondo token.

## Which assets and issuers are included

CoW RWA lists tokens of **7 issuers** only:

- Ondo
- xStocks
- Coinbase
- bStocks
- Reality
- Paxos
- Tether

An asset is listed on CoW RWA when CoinGecko has at least one token of these issuers for it. Assets with tokens of other issuers only are not listed. The tokens of other issuers are not shown or tradable, even for a listed asset.

The asset values from CoinGecko (source A) are **not** filtered by issuer. CoinGecko combines every tokenized version of the asset, including issuers CoW RWA doesn't list. NVIDIA, for example, has 13 tokens of 12 issuers on CoinGecko, and CoW RWA lists 5 of those issuers. On 2026-11-09:

| NVIDIA | All issuers (shown on CoW RWA) | The issuers CoW RWA lists |
|---|---|---|
| Tokenized market cap | $157.7M | $135.4M |
| 24h total volume | $104.5M | $74.9M |

This applies to the Reference price, 24h change, Tokenized market cap and 24h total volume on Explore, and to the same values on the asset page's **Tokenized stock** view. The **Issuer** and **Network** filters on Explore only choose which assets are shown; they don't change the values.

## Explore page

### Market overview

| Caption | Source | How it's calculated |
|---|---|---|
| Tokenized market cap | A `market_cap` | Sum of the Tokenized market cap of every asset listed on CoW RWA (see [Which assets and issuers are included](#which-assets-and-issuers-are-included)). The 7D chart under it is the same sum, hour by hour. |
| 24h total volume | A `total_volume` | Sum of the 24h total volume of every asset listed on CoW RWA. It counts every venue (centralized and decentralized exchanges), every network, and every issuer of those assets, including issuers CoW RWA doesn't list. |

Both totals include only the assets listed on CoW RWA. The "Tokenized Mcap" on coingecko.com covers every RWA on CoinGecko, so it is larger.

### Assets table

| Column | Source | How it's calculated |
|---|---|---|
| Reference price | A `current_price` | Shown as is: the price of one share in tokenized form, combined over every issuer and network. |
| 24h change | A `sparkline_in_7d` | Current price compared with the price 24 hourly points earlier in the 7-day history. When the history has gaps, CoinGecko's own `price_change_percentage_24h` is shown instead. |
| 24h total volume | A `total_volume` | Shown as is: every venue, every issuer, every network. |
| Tokenized market cap | A `market_cap` | Shown as is: the value of the tokens held by investors, over every issuer and network. |

## Asset page

The asset page has a **Stock / Tokenized stock** switch, set to **Stock** by default. It changes the price at the top, the chart and the numbers in the About section. An asset without an Ondo token always shows **Tokenized stock**, and **Stock** can't be selected.

### Price at the top of the page

| Caption | Switch | Source | How it's calculated |
|---|---|---|---|
| Stock price | Stock | E | The share price on its exchange, extended hours included. |
| 24h change next to Stock price | Stock | E | Current price compared with the price at the start of Ondo's last day of 15-minute candles. |
| Reference price | Tokenized stock | A `current_price` | Shown as is. **The same value as the Reference price column on Explore.** |
| 24h change next to Reference price | Tokenized stock | A `sparkline_in_7d` | Calculated like the 24h change column on Explore. **The same value as on Explore.** |

The price chart under it ends at this price: its last point (or the close of its last candle) is the price shown at the top. The rest of the chart is cached for 15 minutes or longer.

### About section

| Caption | Switch | Source | How it's calculated |
|---|---|---|---|
| Day range | Stock | E | Lowest and highest stock price of the day. |
| Day range | Tokenized stock | C, 1 day | Lowest and highest price on the 1-day chart over the last 24 hours. Until the chart loads, CoinGecko's `low_24h` and `high_24h` (A). |
| 52-week range | Stock | E | Ondo's 52-week low and high of the stock. |
| 52-week range | Tokenized stock | C, 1 year | Lowest and highest price on the 1-year chart. Reads "Range since {date}" when the asset has less than a year of prices. |
| Market cap | Stock | E | The market cap of the **company**, not of its tokens. |
| Tokenized market cap | Tokenized stock | A `market_cap` | Shown as is. **The same value as the Tokenized market cap column on Explore.** |
| Volume (24h) | Stock | E | Shares traded on the exchange in the last 24 hours × the current price. |
| Volume (24h) | Tokenized stock | A `total_volume` | Shown as is. **The same value as the 24h total volume column on Explore.** |

### Stock tokens table and Buy cards

Each row or card is **one issuer token on one network**, not the whole asset. The switch doesn't change them.

| Caption | Source | How it's calculated |
|---|---|---|
| Tokenized market cap | B `market_cap` of that issuer token | Shown as is. CoinGecko doesn't split it by network, so the same token on two networks shows the same value. |
| 24h DEX volume (table), 24h vol (cards) | D `volume_usd.h24` | DEX trading of that token on that network only. Usually far below the Explore 24h total volume, which also counts centralized exchanges. |

Added up per issuer (each token counted once, not once per network), these market caps are lower than the asset's Tokenized market cap on Explore. The difference is the tokens of issuers CoW RWA doesn't list (see [Which assets and issuers are included](#which-assets-and-issuers-are-included)).

## Comparing Explore and the asset page

On **Tokenized stock**, the asset page shows the same values as the Explore table: Reference price, 24h change, Tokenized market cap and Volume (24h) (24h total volume on Explore). Both pages read the same CoinGecko data, calculate it the same way and reload it every minute.

Expected differences:

- **Stock view.** On **Stock** (the default), the top price, the 24h change, the ranges, Market cap and Volume (24h) describe the real stock, from Ondo. Explore always shows the tokenized market, so compare with Explore only on **Tokenized stock**.
- **Timing.** Each page can show data up to a minute or two older than the other, so values can differ slightly while the price moves. A page can also first show a copy saved in the browser on an earlier visit, until the fresh data arrives.
- **Chart vs 24h change.** The 1-day chart under the price can disagree with the 24h change by about 0.1%. The 24h change compares with the price about 23–25 hours ago, to the hour; the chart starts exactly 24 hours ago. The chart ends at the price at the top (see [Price at the top of the page](#price-at-the-top-of-the-page)).
- **Stock tokens table and Buy cards.** They show one token's market cap and DEX-only volume on one network, not the asset totals (see [Stock tokens table and Buy cards](#stock-tokens-table-and-buy-cards)).
- **Test deployments.** A deployment without CoinGecko's paid plan charts one issuer token (see [Data sources](#data-sources)), so its chart, Day range and 52-week range differ slightly from production. The other values don't change.

CoW RWA calculates the 24h change from the hourly history rather than showing CoinGecko's own `price_change_percentage_24h`, which it uses only when the history has gaps. A single bad price from one issuer token can distort CoinGecko's value, as on 2026-10-19, when it showed Visa at −70%. A bad price like that can still show on the chart and in the Day range on **Tokenized stock**.

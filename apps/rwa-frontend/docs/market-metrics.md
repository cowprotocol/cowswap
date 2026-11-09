# Market metrics on CoW RWA

Where each market value on the **Explore** page and the **asset page** comes from, how it is calculated, and why the same value can differ between the two pages.

Checked on 2026-11-09. The examples use SanDisk (SNDK).

## Data sources

All CoinGecko links below open in a browser without an API key.

| # | Source | What it holds | Example link | Refreshed every |
|---|---|---|---|---|
| A | CoinGecko RWA markets | One row per asset (e.g. SanDisk), combined over every issuer and network | [`/rwas/markets`](https://api.coingecko.com/api/v3/rwas/markets?per_page=250&page=1&sparkline=true) | 3 min |
| B | CoinGecko coin markets | One row per issuer token (e.g. SanDisk Ondo, SanDisk xStocks) | [`/coins/markets`](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=sandisk-ondo-tokenized,sandisk-corporation-xstock,sandisk-bstocks-tokenized-stock,sandisk-rstock,sandisk-coinbase-tokenized-stock) | 1 min |
| C | CoinGecko price chart of one issuer token | Price history of a single token | [1 day](https://api.coingecko.com/api/v3/coins/sandisk-bstocks-tokenized-stock/market_chart?vs_currency=usd&days=1), [1 year](https://api.coingecko.com/api/v3/coins/sandisk-bstocks-tokenized-stock/market_chart?vs_currency=usd&days=365) | 1 day: 15 min, 1 year: 1 h |
| D | GeckoTerminal (CoinGecko's onchain data) | DEX trading of one token on one network | [SNDKON on Ethereum](https://api.geckoterminal.com/api/v2/networks/eth/tokens/multi/0x71E2400CF1Cb83204f33794eD326636A71a9AAfC) | 5 min |
| E | Ondo (not CoinGecko, needs a key) | The real stock on its exchange | – | 1 min |

In source A, the values are under `tokenized_market_data`:

- `current_price`
- `price_change_percentage_24h`
- `low_24h` and `high_24h`
- `market_cap`
- `total_volume`
- `sparkline_in_7d` (hourly prices of the last 7 days)

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
| 24h change next to Reference price | Tokenized stock | C, 1 day | Current price compared with the chart price exactly 24 hours before CoinGecko's last update. The chart is that of **one** issuer token (see [24h change](#24h-change)). |

### About section

| Caption | Switch | Source | How it's calculated |
|---|---|---|---|
| Day range | Stock | E | Lowest and highest stock price of the day. |
| Day range | Tokenized stock | C, 1 day | Lowest and highest price on the 1-day chart over the last 24 hours. Until the chart loads, CoinGecko's `low_24h` and `high_24h` (A). |
| 52-week range | Stock | E | Ondo's 52-week low and high of the stock. |
| 52-week range | Tokenized stock | C, 1 year | Lowest and highest price on the 1-year chart. Reads "Range since {date}" when the token has less than a year of prices. |
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

## Why values differ between Explore and the asset page

First check the switch on the asset page. On **Stock** (the default) the top price, the change, the ranges, Market cap and Volume (24h) are all about the real stock from Ondo. They are expected to differ from Explore, which always shows the tokenized market. Compare with Explore only on **Tokenized stock**.

### Reference price

Both pages show the same CoinGecko value. A difference comes only from **when** each page last loaded it:

- Each page's data can be cached for up to 1 minute, and kept up to 5 more minutes while it refreshes.
- The asset page reloads its data every minute. Explore reloads only when it's opened again or its browser tab is brought back to the front.
- Both pages can first show a copy saved in the browser on an earlier visit, until the fresh data arrives.

So the two pages can show prices taken a few minutes apart. That's visible when the price moves fast.

### 24h change

The two pages calculate the change in different ways:

| | Explore | Asset page (Tokenized stock) |
|---|---|---|
| Price history | CoinGecko's hourly history of the asset, combined over every issuer and network (A) | The 1-day chart of **one** issuer token: the first one in our list that has prices, e.g. the bStocks token for SanDisk (C) |
| Compared with the price | About 23–25 hours ago, to the hour | Exactly 24 hours before CoinGecko's last update |
| How fresh the history is | Updated every 3 min, with the price | The chart can be 15–30 minutes old, more while it refreshes |

The asset page uses one token's chart on purpose. A single bad price from one token can distort the combined numbers. With one token's chart, the change and the day range also match the chart shown on the page. As a result, the two pages can disagree by a few percent when the price moves fast, or when that token traded differently from the other issuers.

### Tokenized market cap and Volume (24h)

On **Tokenized stock**, the About section shows the same values as the Explore table. Like the price, they differ only by when each page loaded them.

Differences that are expected:

- On **Stock**, Market cap is the company's market cap and Volume (24h) is the stock's exchange volume. Both are much larger than the tokenized values.
- The Stock tokens table and the Buy cards show **one token's** market cap and **DEX-only** volume on one network, not the asset totals.

### Day range and 52-week range

Explore doesn't show them. On the asset page they follow the switch: stock prices from Ondo on **Stock**, the one-token CoinGecko chart on **Tokenized stock**.

import type { DegradableResponse } from '@/shared/api'

export interface RwaAsset {
  ticker: string
  title: string
  type: RwaAssetType
  /** 0..10, higher goes first in the default sorting */
  priority: number
  allowedTradingTime?: RwaTradingTime
  tokens: RwaToken[]
}

export const RWA_ASSET_TYPES = ['stock', 'index'] as const

export type RwaAssetType = (typeof RWA_ASSET_TYPES)[number]

export const RWA_ASSET_TYPE_LABELS: Record<RwaAssetType, string> = { stock: 'Stock', index: 'ETF' }

export interface RwaAssetListItem extends RwaAssetWithMarket {
  /** `RwaTokenMarketData.logoUrl` of the reference token */
  logoUrl: string | null
  /** USD, all networks */
  onchainCap: number | null
  /** USD, all networks */
  dexVolume24h: number | null
  /** 1D price of the reference token */
  series: RwaChartPoint[] | null
}

export interface RwaAssetsFilter {
  type?: RwaAssetType
  /** Matches assets with a token of this issuer, on `chainId` when both are set */
  issuer?: string
  chainId?: number
  /** Matches ticker, title or token symbol */
  query?: string
  tickers?: string[]
}

export interface RwaAssetWithMarket extends RwaAsset {
  market: RwaMarketData | null
}

export interface RwaMarketData {
  /** USD */
  price: number | null
  /** Percent, e.g. `2.5` for +2.5% */
  change24h: number | null
  /** USD */
  dayLow: number | null
  /** USD */
  dayHigh: number | null
  /** USD, sum of all tokenized versions of the asset */
  marketCap: number | null
  /** USD, sum of all tokenized versions of the asset */
  volume24h: number | null
  /** Keyed by `RwaToken.coingeckoId` */
  tokens: Record<string, RwaTokenMarketData>
  /** ISO 8601 */
  updatedAt: string | null
}

export interface RwaMarketOverview extends DegradableResponse {
  totals: RwaMarketOverviewTotals
  /** Max 3, by 24h DEX volume */
  mostTraded: RwaMarketOverviewItem[]
  /** Max 3, `change24h > 0` */
  gainers: RwaMarketOverviewItem[]
  /** Max 3, `change24h < 0` */
  losers: RwaMarketOverviewItem[]
  /** ISO 8601, latest `RwaMarketData.updatedAt` */
  updatedAt: string | null
  /** `allowedTradingTime` of the first registry asset that has one */
  tradingTime: RwaTradingTime | null
}

export interface RwaMarketOverviewItem {
  ticker: string
  title: string
  /** `RwaTokenMarketData.logoUrl` of the reference token */
  logoUrl: string | null
  /** Percent */
  change24h: number | null
  /** USD, all networks */
  dexVolume24h: number | null
  /** Hourly DEX volume in `mostTraded`, 1D price in movers */
  series: RwaChartPoint[] | null
}

export interface RwaMarketOverviewTotals {
  /** USD */
  onchainCap: number | null
  /** USD */
  dexVolume24h: number | null
  /** 7 days */
  onchainCapSeries: RwaChartPoint[] | null
}

/** Stats of every asset token on one network */
export interface RwaNetworkStats extends DegradableResponse {
  ticker: string
  chainId: number
  tokens: RwaTokenNetworkStats[]
}

export interface RwaRegistry {
  version: string
  /** ISO 8601 */
  lastModificationTime: string
  assets: RwaAsset[]
}

export interface RwaToken {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  /** Company that tokenizes the asset, e.g. `xStocks` */
  issuer: string
  /** CoinGecko coin id of this token, used to fetch market data */
  coingeckoId?: string
}

/** Market data of one CoinGecko coin, which is shared by the token deployments on all networks */
export interface RwaTokenMarketData {
  /** USD */
  price: number | null
  /** USD */
  marketCap: number | null
  /** USD */
  volume24h: number | null
  logoUrl: string | null
}

export interface RwaTokenNetworkStats {
  address: string
  /** USD, supply on the network times the token price */
  onchainCap: number | null
  /** USD, DEX trades on the network */
  dexVolume24h: number | null
}

export interface RwaTradingTime {
  title: string
  /** `HH:mm UTC` */
  start: string
  /** `HH:mm UTC` */
  end: string
}

export const RWA_SORT_FIELDS = [
  'priority',
  'marketCap',
  'onchainCap',
  'dexVolume24h',
  'change24h',
  'price',
  'ticker',
] as const

export interface RwaAssetResponse extends RwaAssetWithMarket, DegradableResponse {}

export interface RwaAssetsPage extends DegradableResponse {
  items: RwaAssetListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  /** Matches of each type with every filter but `type` applied */
  typeCounts: Record<RwaAssetType, number>
  /** Issuers in the registry, for the filter */
  issuers: string[]
  /** Networks in the registry, for the filter */
  chainIds: number[]
}

export interface RwaAssetsSearchResult extends DegradableResponse {
  items: RwaAssetWithMarket[]
}

export type RwaSortField = (typeof RWA_SORT_FIELDS)[number]

export type RwaSortOrder = 'asc' | 'desc'

export const RWA_CHART_RANGES = ['1D', '1W', '1M', '1Y', 'ALL'] as const

export const RWA_QUOTE_SIDES = ['buy', 'sell'] as const

/** Quotes of every asset token on one network against a fixed USDC amount */
export interface RwaAssetQuotes extends DegradableResponse {
  ticker: string
  chainId: number
  side: RwaQuoteSide
  /** USD, spent on `buy` and received on `sell` */
  amountUsd: number
  quotes: RwaTokenQuote[]
}

export interface RwaChart {
  ticker: string
  range: RwaChartRange
  points: RwaChartPoint[]
}

export interface RwaChartPoint {
  /** Unix seconds */
  time: number
  /** USD */
  value: number
}

export type RwaChartRange = (typeof RWA_CHART_RANGES)[number]

export type RwaQuoteSide = (typeof RWA_QUOTE_SIDES)[number]

/** [Token list](https://tokenlists.org) of every token in the registry */
export interface RwaTokenList {
  name: string
  /** ISO 8601 */
  timestamp: string
  version: { major: number; minor: number; patch: number }
  tokens: RwaTokenListToken[]
}

export interface RwaTokenListToken extends Omit<RwaToken, 'coingeckoId' | 'issuer'> {
  extensions: { ticker: string }
}

export interface RwaTokenQuote {
  address: string
  /** Atoms of the asset token, received on `buy` and spent on `sell`. `null` when there is no quote */
  amount: string | null
  /** `true` when the order book simulated the trade. Unverified amounts can be far off */
  verified: boolean
  /** Order book `errorType` (e.g. `NoLiquidity`), or `Unavailable` when the order book could not be reached */
  error: string | null
}

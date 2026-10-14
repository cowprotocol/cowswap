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

export type RwaAssetType = 'stock' | 'index'

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
  /** ISO 8601 */
  updatedAt: string | null
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
  /** CoinGecko coin id of this token, used to fetch market data */
  coingeckoId?: string
}

export interface RwaTradingTime {
  title: string
  /** `HH:mm UTC` */
  start: string
  /** `HH:mm UTC` */
  end: string
}

export const RWA_SORT_FIELDS = ['priority', 'marketCap', 'change24h', 'price', 'ticker'] as const

export interface RwaAssetResponse extends RwaAssetWithMarket, DegradableResponse {}

export interface RwaAssetsPage extends DegradableResponse {
  items: RwaAssetWithMarket[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface RwaAssetsSearchResult extends DegradableResponse {
  items: RwaAssetWithMarket[]
}

export type RwaSortField = (typeof RWA_SORT_FIELDS)[number]

export type RwaSortOrder = 'asc' | 'desc'

export const RWA_CHART_RANGES = ['1D', '1W', '1M', '1Y', 'ALL'] as const

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

/** [Token list](https://tokenlists.org) of every token in the registry */
export interface RwaTokenList {
  name: string
  /** ISO 8601 */
  timestamp: string
  version: { major: number; minor: number; patch: number }
  tokens: RwaTokenListToken[]
}

export interface RwaTokenListToken extends Omit<RwaToken, 'coingeckoId'> {
  extensions: { ticker: string }
}

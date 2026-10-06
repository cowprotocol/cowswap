import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface PriceChartBar {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type PriceChartInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '7d'

export type PriceChartMetric = 'marketCap' | 'price'

export type PriceChartMode = 'advanced' | 'simple'

export interface PriceChartQueryParams {
  address: string
  chainId: SupportedChainId
  from: number
  to: number
  resolution: PriceChartResolution
  countback?: number
}

export type PriceChartResolution =
  | '1S'
  | '5S'
  | '15S'
  | '30S'
  | '1'
  | '5'
  | '15'
  | '30'
  | '60'
  | '240'
  | '720'
  | '1D'
  | '7D'

export interface PriceChartSummary {
  change: number
  price: number
}

export type PriceChartSupplyBasis = 'circulating' | 'total'

export type SimplePriceChartPeriod = '1H' | '1D' | '1W' | '1M' | '1Y' | 'All'

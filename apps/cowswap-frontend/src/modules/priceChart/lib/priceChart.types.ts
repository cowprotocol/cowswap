import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

export interface PriceChartAsset extends PriceChartAssetDescriptor {
  selection: PriceChartSelection
}

export interface PriceChartAssetDescriptor {
  address: string
  chainId: SupportedChainId
  symbol: string
}

export interface PriceChartBar {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface PriceChartContainerProps {
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  sizeControl?: PriceChartSizeControl
}

export type PriceChartHistoryStatus = 'loading' | 'empty' | 'error' | null

export type PriceChartInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '7d'

export type PriceChartMetric = 'marketCap' | 'price'

export interface PriceChartPureProps {
  activeAsset: PriceChartAsset | undefined
  assets: PriceChartAsset[]
  metric: PriceChartMetric
  onSelectMetric: (metric: PriceChartMetric) => void
  onSelectSelection: (selection: PriceChartSelection) => void
  sizeControl?: PriceChartSizeControl
  supplyBasis?: PriceChartSupplyBasis
}

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

export type PriceChartSelection = 'sell' | 'buy'
export interface PriceChartSizeControl {
  isExpanded: boolean
  onToggle: () => void
}

export interface PriceChartSummary {
  change: number
  price: number
}

export type PriceChartSupplyBasis = 'circulating' | 'total'

export type SimplePriceChartPeriod = '1H' | '1D' | '1W' | '1M' | '1Y' | 'All'

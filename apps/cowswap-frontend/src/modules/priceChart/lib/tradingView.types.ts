import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, Fraction, Price } from '@cowprotocol/currency'

import type { IBasicDataFeed, LibrarySymbolInfo, SearchSymbolResultItem } from './charting_library'
import type { PriceChartBar, PriceChartMetric } from './priceChart.types'

export interface CreatePriceChartDatafeedParams {
  metric: PriceChartMetric
  onHistoryLoaded?: (bars: PriceChartBar[]) => void
  onStatusChange: (status: PriceChartHistoryStatus) => void
  symbols: PriceChartSymbolDescriptor[]
}

export interface PriceChartAssetDescriptor {
  address: string
  chainId: SupportedChainId
  symbol: string
}

export interface PriceChartContainerProps {
  executionPrice?: Price<Currency, Currency> | null
  inputCurrency: Currency | null
  limitPrice?: Price<Currency, Currency> | null
  onSelectLimitPrice?: (price: Fraction) => void
  outputCurrency: Currency | null
  sizeControl?: PriceChartSizeControl
}

export interface PriceChartDatafeedController {
  datafeed: IBasicDataFeed
  dispose: () => void
}

export type PriceChartHistoryStatus = 'loading' | 'empty' | 'error' | null

export interface PriceChartPureProps {
  activeSymbol: PriceChartSymbolDescriptor | undefined
  executionLinePrice?: number | null
  limitLinePrice?: number | null
  metric: PriceChartMetric
  onSelectMetric: (metric: PriceChartMetric) => void
  onSelectPrice?: (price: number) => void
  onSelectSelection: (selection: PriceChartSelection) => void
  sizeControl?: PriceChartSizeControl
  symbols: PriceChartSymbolDescriptor[]
}

export type PriceChartSelection = 'sell' | 'buy'

export interface PriceChartSizeControl {
  isExpanded: boolean
  onToggle: () => void
}

export interface PriceChartSymbolDescriptor {
  baseAsset: PriceChartAssetDescriptor
  description: string
  librarySymbolInfo: LibrarySymbolInfo
  searchSymbol: SearchSymbolResultItem
  selection: PriceChartSelection
  ticker: string
}

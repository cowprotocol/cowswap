import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, Fraction, Price } from '@cowprotocol/currency'

import type { IBasicDataFeed, LibrarySymbolInfo, SearchSymbolResultItem } from './charting_library'
import type { PriceChartBar, PriceChartMetric, PriceChartSupplyBasis } from './priceChart.types'

export interface CreatePriceChartDatafeedParams {
  metric: PriceChartMetric
  onHistoryLoaded?: (bars: PriceChartBar[]) => void
  onStatusChange: (status: PriceChartHistoryStatus) => void
  symbols: PriceChartSymbolDescriptor[]
  supplyBasis?: PriceChartSupplyBasis
}

export interface PriceChartAssetDescriptor {
  address: string
  chainId: SupportedChainId
  symbol: string
}

export interface PriceChartContainerProps {
  executionPrice?: Price<Currency, Currency> | null
  inputCurrency: Currency | null
  onSelectLimitPrice?: (price: Fraction) => void
  outputCurrency: Currency | null
  referenceLines?: PriceChartReferenceLine<Price<Currency, Currency> | null>[]
  sizeControl?: PriceChartSizeControl
}

export interface PriceChartDatafeedController {
  datafeed: IBasicDataFeed
  dispose: () => void
}

export interface PriceChartExecutionMarker {
  activeAmount: string
  activeTokenSymbol: string
  counterAmount: string
  counterTokenSymbol: string
  id: string
  side: 'buy' | 'sell'
  timestamp: number
  title: string
}

export type PriceChartHistoryStatus = 'loading' | 'empty' | 'error' | null

export interface PriceChartPureProps {
  activeSymbol: PriceChartSymbolDescriptor | undefined
  executionMarkers: PriceChartExecutionMarker[]
  executionLinePrice?: number | null
  metric: PriceChartMetric
  onSelectMetric: (metric: PriceChartMetric) => void
  onSelectPrice?: (price: number) => void
  onSelectSelection: (selection: PriceChartSelection) => void
  referenceLines: PriceChartReferenceLine<number>[]
  sizeControl?: PriceChartSizeControl
  symbols: PriceChartSymbolDescriptor[]
  supplyBasis?: PriceChartSupplyBasis
}

export interface PriceChartReferenceLine<TPrice> {
  id: string
  label: string
  labels?: Partial<Record<PriceChartSelection, string>>
  price: TPrice
  variant: PriceChartReferenceLineVariant
}

export type PriceChartReferenceLineVariant = 'open-order' | 'trade' | 'unfillable-order'

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

import type { QueryClient } from '@tanstack/react-query'

import type { Currency } from '@cowprotocol/currency'

import type { IBasicDataFeed, LibrarySymbolInfo } from './loadChartingLibrary'
import type { Candle, ChartMetric, SupplyVariant } from './priceChart.types'

export interface CreatePriceChartDatafeedParams {
  queryClient: QueryClient
  metric: ChartMetric
  onHistoryLoaded?: (bars: Candle[]) => void
  onStatusChange: (status: PriceChartHistoryStatus) => void
  symbols: PriceChartSymbolDescriptor[]
  supplyVariant?: SupplyVariant
}

export interface PriceChartDatafeedController {
  datafeed: IBasicDataFeed
  dispose: () => void
}

export type PriceChartHistoryStatus = 'loading' | 'empty' | 'error' | null

export interface PriceChartSymbolDescriptor {
  currency: Currency
  librarySymbolInfo: LibrarySymbolInfo
  ticker: string
}

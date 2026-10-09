import type { QueryClient } from '@tanstack/react-query'

import type { Currency } from '@cowprotocol/currency'

import type { IBasicDataFeed, LibrarySymbolInfo } from './loadChartingLibrary'
import type { Candle, ChartMetric, SupplyVariant } from './priceChart.types'

export interface CreatePriceChartDatafeedParams {
  queryClient: QueryClient
  onHistoryLoaded?: (bars: Candle[]) => void
  symbols: PriceChartSymbolDescriptor[]
}

export interface PriceChartDatafeedController {
  datafeed: IBasicDataFeed
  setActiveTicker: (ticker: string) => void
  dispose: () => void
}

export interface PriceChartSymbolDescriptor {
  metric: ChartMetric
  supplyVariant: SupplyVariant
  currency: Currency
  librarySymbolInfo: LibrarySymbolInfo
  ticker: string
}

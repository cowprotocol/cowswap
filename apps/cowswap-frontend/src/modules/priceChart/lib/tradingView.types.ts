import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import type { IBasicDataFeed, LibrarySymbolInfo, SearchSymbolResultItem } from './charting_library'
import type { PriceChartCurrencyCode } from './priceChart.types'

export interface PriceChartCurrencyDescriptor {
  address?: string
  chainId?: SupportedChainId
  kind: 'token' | 'usd'
  key: string
  name: string
  symbol: string
}

export interface PriceChartResolvedPriceRequest {
  address: string
  chainId: SupportedChainId
  currencyCode: PriceChartCurrencyCode
  isFallback: boolean
}

export interface PriceChartSymbolDescriptor {
  baseAsset: PriceChartCurrencyDescriptor
  description: string
  librarySymbolInfo: LibrarySymbolInfo
  quoteAsset: PriceChartCurrencyDescriptor
  searchSymbol: SearchSymbolResultItem
  ticker: string
}

export interface PriceChartHistoryStatus {
  kind: 'idle' | 'loading' | 'ready' | 'empty' | 'error'
  message?: string
  ticker?: string
}

export interface PriceChartContainerProps {
  inputCurrency: Currency | null
  outputCurrency: Currency | null
}

export interface PriceChartPureProps {
  activeTicker: string
  onSelectTicker: (ticker: string) => void
  symbols: PriceChartSymbolDescriptor[]
}

export interface CreatePriceChartDatafeedParams {
  onStatusChange: (status: PriceChartHistoryStatus) => void
  symbols: PriceChartSymbolDescriptor[]
}

export interface PriceChartDatafeedController {
  datafeed: IBasicDataFeed
  dispose: () => void
}

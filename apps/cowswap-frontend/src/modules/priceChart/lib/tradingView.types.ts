import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, Fraction, Price } from '@cowprotocol/currency'

import type { IBasicDataFeed, LibrarySymbolInfo, SearchSymbolResultItem } from './charting_library'
import type { PriceChartCurrencyCode } from './priceChart.types'

export type PriceChartFormat = 1 | 2 | 3 | 4

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
  selectionId: PriceChartFormat
  ticker: string
}

export interface PriceChartHistoryStatus {
  kind: 'idle' | 'loading' | 'ready' | 'empty' | 'error'
  latestPrice?: number
  message?: string
  ticker?: string
}

export interface PriceChartContainerProps {
  executionPrice?: Price<Currency, Currency> | null
  inputCurrency: Currency | null
  limitPrice?: Price<Currency, Currency> | null
  onSelectLimitPrice?: (price: Fraction) => void
  outputCurrency: Currency | null
}

export interface PriceChartPureProps {
  activeTicker: string
  executionLinePrice?: number | null
  limitLinePrice?: number | null
  onSelectPrice?: (price: number) => void
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

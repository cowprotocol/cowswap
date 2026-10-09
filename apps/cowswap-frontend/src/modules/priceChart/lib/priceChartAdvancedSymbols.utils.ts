import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { FALLBACK_TOKEN_SYMBOL } from '../config/priceChart.constants'
import {
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
  PRO_CHART_SYMBOL_TYPE,
} from '../config/priceChartAdvanced.constants'

import type { ChartMetric, SupplyVariant } from './priceChart.types'
import type { LibrarySymbolInfo } from './priceChartAdvancedLibrary.types'

export interface ChartSymbol {
  metric: ChartMetric
  supplyVariant: SupplyVariant
  currency: Currency
  librarySymbolInfo: LibrarySymbolInfo
  ticker: string
}

const SERIES_VARIANTS = [
  { metric: 'price', supplyVariant: 'circulating' },
  { metric: 'marketCap', supplyVariant: 'circulating' },
  { metric: 'marketCap', supplyVariant: 'total' },
] as const

export function createChartSymbols(currencies: Currency[]): ChartSymbol[] {
  return currencies.flatMap((currency) =>
    SERIES_VARIANTS.map(({ metric, supplyVariant }) => {
      const ticker = `${currency.chainId}_${getAddressKey(getCurrencyAddress(currency))}_USD_${metric}_${supplyVariant}`
      const symbol = currency.symbol || FALLBACK_TOKEN_SYMBOL
      const description = metric === 'price' ? symbol : `${symbol} Market Cap`

      return {
        currency,
        metric,
        supplyVariant,
        ticker,
        librarySymbolInfo: {
          data_status: 'streaming',
          description,
          exchange: PRO_CHART_EXCHANGE_NAME,
          format: 'price',
          has_daily: true,
          has_intraday: true,
          has_weekly_and_monthly: true,
          listed_exchange: PRO_CHART_EXCHANGE_NAME,
          minmov: 1,
          name: ticker,
          pricescale: metric === 'price' ? 1_000_000_000_000 : 1,
          session: '24x7',
          supported_resolutions: PRO_CHART_SUPPORTED_RESOLUTIONS,
          ticker,
          timezone: 'Etc/UTC',
          type: PRO_CHART_SYMBOL_TYPE,
          visible_plots_set: 'ohlcv',
          volume_precision: 2,
        },
      }
    }),
  )
}

export function findChartSymbol(symbols: ChartSymbol[], ticker: string): ChartSymbol | undefined {
  return symbols.find((symbol) => symbol.ticker === ticker)
}

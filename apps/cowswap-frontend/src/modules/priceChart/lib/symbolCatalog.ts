import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import {
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
  PRO_CHART_SYMBOL_TYPE,
} from './tradingView.constants'

import type { PriceChartSymbolDescriptor } from './tradingView.types'

export function createChartSymbols(currencies: Currency[]): PriceChartSymbolDescriptor[] {
  return currencies.map((currency) => {
    const ticker = `${currency.chainId}:${getAddressKey(getCurrencyAddress(currency))}:USD`
    const description = `${currency.symbol || 'TOKEN'}/USD`

    return {
      currency,
      ticker,
      librarySymbolInfo: {
        data_status: 'endofday',
        description,
        exchange: PRO_CHART_EXCHANGE_NAME,
        format: 'price',
        has_daily: true,
        has_intraday: true,
        has_weekly_and_monthly: true,
        listed_exchange: PRO_CHART_EXCHANGE_NAME,
        minmov: 1,
        name: ticker,
        pricescale: 1_000_000_000_000,
        session: '24x7',
        supported_resolutions: PRO_CHART_SUPPORTED_RESOLUTIONS,
        ticker,
        timezone: 'Etc/UTC',
        type: PRO_CHART_SYMBOL_TYPE,
        visible_plots_set: 'ohlcv',
        volume_precision: 2,
      },
    }
  })
}

export function findChartSymbol(
  symbols: PriceChartSymbolDescriptor[],
  ticker: string,
): PriceChartSymbolDescriptor | undefined {
  return symbols.find((symbol) => symbol.ticker === ticker)
}

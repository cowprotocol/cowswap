import { queryOptions } from '@tanstack/react-query'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { loadPriceChartHistory } from './loadPriceChartHistory'

import type { Candle, CandleInterval } from './priceChart.types'

export function priceHistoryQueryOptions(
  currency: Currency,
  from: number,
  to: number,
  interval: CandleInterval,
): ReturnType<typeof queryOptions<Candle[]>> {
  const token = getWrappedToken(currency)
  return queryOptions({
    queryKey: ['priceChart', 'prices', token.chainId, getAddressKey(token.address), interval, from, to],
    queryFn: () => loadPriceChartHistory(currency, from, to, interval, 'price', 'circulating'),
    staleTime: 0,
    retry: false,
  })
}

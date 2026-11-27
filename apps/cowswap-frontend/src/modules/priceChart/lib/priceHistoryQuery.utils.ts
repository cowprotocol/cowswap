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
  return queryOptions<Candle[]>({
    queryKey: ['priceChart', 'prices', token.chainId, getAddressKey(token.address), interval, from, to],
    queryFn: () =>
      loadPriceChartHistory(
        currency,
        from,
        Math.min(to, Math.floor(Date.now() / 1000)),
        interval,
        'price',
        'circulating',
      ),
    staleTime: 30_000,
    retry: false,
  })
}

import { keepPreviousData, skipToken, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { loadPriceChartHistory, toMarketCapBars } from '../lib/loadPriceChartHistory'
import { getTimeRangeConfig } from '../lib/priceChart.utils'

import type { Candle, ChartMetric, SupplyVariant } from '../lib/chart.types'
import type { TimeRange } from '../lib/priceChart.utils'

export function usePriceChartHistory(
  currency: Currency | undefined,
  period: TimeRange,
  metric: ChartMetric,
  supplyVariant: SupplyVariant,
): UseQueryResult<Candle[]> {
  const queryClient = useQueryClient()
  const token = currency ? getWrappedToken(currency) : undefined
  const chainId = token?.chainId
  const address = token ? getAddressKey(token.address) : undefined
  return useQuery({
    queryKey: [
      'priceChart',
      'history',
      chainId,
      address,
      period,
      metric,
      metric === 'marketCap' ? supplyVariant : null,
    ],
    queryFn: currency
      ? async () => {
          const bars = await queryClient.fetchQuery({
            queryKey: ['priceChart', 'prices', chainId, address, period],
            queryFn: () => {
              const { from, interval, to } = getTimeRangeConfig(period, Date.now() / 1000)
              return loadPriceChartHistory(currency, from, to, interval, 'price', supplyVariant)
            },
            retry: false,
          })

          return metric === 'price' ? bars : toMarketCapBars(currency, bars, supplyVariant)
        }
      : skipToken,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

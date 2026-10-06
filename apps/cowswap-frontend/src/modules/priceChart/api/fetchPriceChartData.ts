import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { logPriceChart } from './logPriceChart'

import { CANDLE_INTERVALS, PRICE_CHART_TIMEOUT } from '../lib/priceChart.constants'

import type { Candle, CandleInterval } from '../lib/chart.types'

export interface PriceHistoryQuery {
  address: string
  chainId: SupportedChainId
  from: number
  to: number
  interval: CandleInterval
}

interface PriceChartResponse {
  providerId: number
  bars: Candle[]
}

export async function fetchPriceChartData(params: PriceHistoryQuery): Promise<Candle[]> {
  const { interval } = params

  if (!CANDLE_INTERVALS.includes(interval)) {
    throw new Error(`Unsupported price chart interval: ${params.interval}`)
  }

  const query = new URLSearchParams({
    from: String(params.from),
    to: String(params.to),
    interval,
  })

  const url = `${BFF_BASE_URL}/${params.chainId}/tokens/${params.address}/priceHistory?${query}`
  const symbol = `${params.address}:${params.chainId}`

  logPriceChart.debug('Fetching bars', {
    from: params.from,
    interval: params.interval,
    symbol,
    to: params.to,
  })

  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: 'application/json' },
      timeout: PRICE_CHART_TIMEOUT,
      timeoutMessage: 'Price chart request timed out',
    })

    if (!response.ok) {
      throw new Error(`Price chart request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as PriceChartResponse

    logPriceChart.info('Fetched bars', {
      bars: payload.bars.length,
      providerId: payload.providerId,
      symbol,
    })

    return payload.bars
  } catch (error) {
    logPriceChart.warn('Failed to fetch bars', error, {
      symbol,
    })

    throw error
  }
}

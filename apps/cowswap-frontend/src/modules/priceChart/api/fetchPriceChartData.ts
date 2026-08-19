import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'

import { logPriceChart } from './logPriceChart'

import { PRICE_CHART_TIMEOUT } from '../lib/priceChart.constants'
import { PriceChartBar, PriceChartInterval, PriceChartQueryParams, PriceChartResolution } from '../lib/priceChart.types'

interface PriceChartResponse {
  providerId: number
  bars: PriceChartBar[]
}

const INTERVAL_BY_RESOLUTION: Partial<Record<PriceChartResolution, PriceChartInterval>> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  '7D': '7d',
}

export async function fetchPriceChartData(params: PriceChartQueryParams): Promise<PriceChartBar[]> {
  const url = buildPriceChartUrl(params)
  const symbol = `${params.address}:${params.chainId}`

  logPriceChart.debug('Fetching bars', {
    countback: params.countback,
    from: params.from,
    resolution: params.resolution,
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

function buildPriceChartUrl(params: PriceChartQueryParams): string {
  const interval = INTERVAL_BY_RESOLUTION[params.resolution]

  if (!interval) {
    throw new Error(`Unsupported price chart resolution: ${params.resolution}`)
  }

  const query = new URLSearchParams({
    from: String(params.from),
    to: String(params.to),
    interval,
  })

  if (params.countback !== undefined) {
    query.set('countback', String(params.countback))
  }

  return `${BFF_BASE_URL}/${params.chainId}/tokens/${params.address}/priceHistory?${query}`
}

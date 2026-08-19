import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'

import { logPriceChart } from './logPriceChart'

import { PRICE_CHART_TIMEOUT } from '../lib/priceChart.constants'
import { PriceChartBar, PriceChartQueryParams } from '../lib/priceChart.types'

interface PriceChartResponse {
  bars: PriceChartBar[]
}

export async function fetchPriceChartData(params: PriceChartQueryParams): Promise<PriceChartBar[]> {
  const url = buildPriceChartUrl(params)
  const currencyCode = params.currencyCode === 'TOKEN' ? 'TOKEN' : 'USD'
  const symbol = `${params.address}:${params.chainId}`

  logPriceChart('Fetching bars', {
    countback: params.countback,
    currencyCode,
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

    logPriceChart('Fetched bars', {
      bars: payload.bars.length,
      currencyCode,
      symbol,
    })

    return payload.bars
  } catch (error) {
    logPriceChart('Failed to fetch bars', error, {
      currencyCode,
      symbol,
    })

    throw error
  }
}

function buildPriceChartUrl(params: PriceChartQueryParams): string {
  const currencyCode = params.currencyCode === 'TOKEN' ? 'TOKEN' : 'USD'
  const query = new URLSearchParams({
    address: params.address,
    chainId: String(params.chainId),
    from: String(params.from),
    to: String(params.to),
    resolution: params.resolution,
    currencyCode,
    removeEmptyBars: String(params.removeEmptyBars ?? true),
    removeLeadingNullValues: String(params.removeLeadingNullValues ?? true),
  })

  if (params.countback !== undefined) {
    query.set('countback', String(params.countback))
  }

  return `${BFF_BASE_URL}/proxies/codex/token-bars?${query}`
}

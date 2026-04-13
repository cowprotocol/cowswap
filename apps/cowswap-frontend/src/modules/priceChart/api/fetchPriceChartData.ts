import { fetchWithTimeout } from '@cowprotocol/common-utils'

import { Codex, type GetTokenBarsQuery, type QuoteCurrency } from '@codex-data/sdk'

import { logPriceChart } from './logPriceChart'

import {
  CODEX_API_KEY_ENV,
  CODEX_TIMEOUT,
  DEFAULT_CODEX_API_KEY,
  LEGACY_DEFINED_API_KEY_ENV,
} from '../lib/priceChart.constants'
import { PriceChartBar, PriceChartQueryParams } from '../lib/priceChart.types'

type TokenBarsResponse = NonNullable<GetTokenBarsQuery['getTokenBars']>

function getCodexApiKey(): string {
  return process.env[CODEX_API_KEY_ENV] || process.env[LEGACY_DEFINED_API_KEY_ENV] || DEFAULT_CODEX_API_KEY
}

function createCodexClient(apiKey: string): Codex {
  return new Codex(apiKey, {
    ws: false,
    fetch: (input, init) =>
      fetchWithTimeout(String(input), {
        ...init,
        timeout: CODEX_TIMEOUT,
        timeoutMessage: 'Codex price chart request timed out',
      }),
  })
}

function mapBars(response: TokenBarsResponse): PriceChartBar[] {
  const barsCount = response.t.length

  if (
    response.o.length !== barsCount ||
    response.h.length !== barsCount ||
    response.l.length !== barsCount ||
    response.c.length !== barsCount ||
    (response.volume && response.volume.length !== barsCount)
  ) {
    throw new Error('Codex price chart response has inconsistent array lengths')
  }

  return response.t.reduce<PriceChartBar[]>((acc, time, index) => {
    const open = response.o[index]
    const high = response.h[index]
    const low = response.l[index]
    const close = response.c[index]

    if (open === null || high === null || low === null || close === null) {
      return acc
    }

    acc.push({
      open,
      high,
      low,
      close,
      time,
      status: response.s,
      volume: response.volume?.[index] ?? undefined,
    })

    return acc
  }, [])
}

export async function fetchPriceChartData(params: PriceChartQueryParams): Promise<PriceChartBar[]> {
  const sdk = createCodexClient(getCodexApiKey())
  const currencyCode = (params.currencyCode === 'TOKEN' ? 'TOKEN' : 'USD') as QuoteCurrency
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
    const response = await sdk.queries.getTokenBars({
      symbol,
      from: params.from,
      to: params.to,
      resolution: params.resolution,
      currencyCode,
      countback: params.countback,
      removeEmptyBars: params.removeEmptyBars ?? true,
      removeLeadingNullValues: params.removeLeadingNullValues ?? true,
    })

    if (!response.getTokenBars) {
      throw new Error('Codex price chart response is empty')
    }

    const bars = mapBars(response.getTokenBars)

    logPriceChart('Fetched bars', {
      bars: bars.length,
      currencyCode,
      symbol,
    })

    return bars
  } catch (error) {
    logPriceChart('Failed to fetch bars', error, {
      currencyCode,
      symbol,
    })

    throw error
  }
}

import { normalizeError } from '@cowprotocol/common-utils/errors'

import type { NextRequest } from 'next/server'

import { CHART_REVALIDATE_SECONDS, getAssetByTicker, getAssetCandles } from '@/entities/asset/index.server'
import { RWA_CHART_RANGES, type RwaCandleChart } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseEnumParam } from '@/shared/lib/http'

/**
 * Query: `range` (1D | 1W | 1M | 1Y | ALL, default 1D)
 */
export async function getCandlesHandler(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = getAssetByTicker(ticker)
  const range = parseEnumParam(request.nextUrl.searchParams.get('range'), RWA_CHART_RANGES, '1D')

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)
  if (range === null) return errorResponse(400, `Invalid "range", expected one of: ${RWA_CHART_RANGES.join(', ')}`)

  try {
    const chart: RwaCandleChart = { ticker: asset.ticker, range, candles: await getAssetCandles(asset, range) }

    return jsonResponse(chart, CHART_REVALIDATE_SECONDS[range])
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load candles', error)

    return errorResponse(502, 'Chart data is temporarily unavailable')
  }
}

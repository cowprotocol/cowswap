import { normalizeError } from '@cowprotocol/common-utils/errors'

import type { NextRequest } from 'next/server'

import { getAssetChart, getAssetByTicker } from '@/entities/asset/index.server'
import { RWA_CHART_RANGES, type RwaChart } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseEnumParam } from '@/shared/lib/http'

/**
 * Query: `range` (1D | 1W | 1M | 1Y | ALL, default 1D)
 */
export async function getChartHandler(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = getAssetByTicker(ticker)
  const range = parseEnumParam(request.nextUrl.searchParams.get('range'), RWA_CHART_RANGES, '1D')

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)
  if (range === null) return errorResponse(400, `Invalid "range", expected one of: ${RWA_CHART_RANGES.join(', ')}`)

  try {
    const chart: RwaChart = { ticker: asset.ticker, range, points: await getAssetChart(asset, range) }

    return jsonResponse(chart, range === '1D' ? 300 : 3600)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load chart', error)

    return errorResponse(502, 'Chart data is temporarily unavailable')
  }
}

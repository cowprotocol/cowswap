import { normalizeError } from '@cowprotocol/common-utils/errors'

import type { NextRequest } from 'next/server'

import {
  CHART_REVALIDATE_SECONDS,
  getAssetChart,
  getAssetStockChart,
  getAssetByTicker,
  RWA_CHART_RANGES,
  RWA_MARKET_KINDS,
} from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseEnumParam } from '@/shared/lib/http'

/**
 * Query: `range` (1D | 1W | 1M | 1Y | ALL, default 1D), `market` (stock | tokenized, default tokenized)
 */
export async function getChartHandler(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = getAssetByTicker(ticker)
  const range = parseEnumParam(request.nextUrl.searchParams.get('range'), RWA_CHART_RANGES, '1D')
  const market = parseEnumParam(request.nextUrl.searchParams.get('market'), RWA_MARKET_KINDS, 'tokenized')

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)
  if (range === null) return errorResponse(400, `Invalid "range", expected one of: ${RWA_CHART_RANGES.join(', ')}`)
  if (market === null) return errorResponse(400, `Invalid "market", expected one of: ${RWA_MARKET_KINDS.join(', ')}`)

  try {
    return jsonResponse(
      await (market === 'stock' ? getAssetStockChart : getAssetChart)(asset, range),
      CHART_REVALIDATE_SECONDS[range],
    )
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load chart', error)

    return errorResponse(502, 'Chart data is temporarily unavailable')
  }
}

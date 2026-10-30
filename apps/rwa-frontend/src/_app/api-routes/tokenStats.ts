import type { NextRequest } from 'next/server'

import { getAssetByTicker, getAssetTokenStats } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse } from '@/shared/lib/http'

const TOKEN_STATS_MAX_AGE_SECONDS = 60

/** Onchain cap and DEX volume of every asset token, on every network it has */
export async function getTokenStatsHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = getAssetByTicker(ticker)

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)

  return jsonResponse(await getAssetTokenStats(asset), TOKEN_STATS_MAX_AGE_SECONDS)
}

import { parseAssetChainId } from './assetChainId'

import type { NextRequest } from 'next/server'

import { getAssetByTicker, getAssetNetworkStats } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse } from '@/shared/lib/http'

const NETWORK_STATS_MAX_AGE_SECONDS = 60

/**
 * Onchain cap and DEX volume of every asset token on a network.
 * Query: `chainId` (required, a network with tokens of the asset)
 */
export async function getNetworkStatsHandler(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const { searchParams } = request.nextUrl
  const asset = getAssetByTicker(ticker)

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)

  const chainId = parseAssetChainId(asset, searchParams)

  if (chainId === null) {
    return errorResponse(
      400,
      `Invalid "chainId", "${asset.ticker}" has no tokens on chain ${searchParams.get('chainId')}`,
    )
  }

  return jsonResponse(await getAssetNetworkStats(asset, chainId), NETWORK_STATS_MAX_AGE_SECONDS)
}

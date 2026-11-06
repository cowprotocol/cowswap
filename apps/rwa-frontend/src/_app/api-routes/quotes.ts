import { normalizeError } from '@cowprotocol/common-utils/errors'
import { isSupportedChain } from '@cowprotocol/cow-sdk'

import { parseAssetChainId } from './assetChainId'

import type { NextRequest } from 'next/server'

import { getAssetByTicker, getAssetQuotes, RWA_QUOTE_SIDES } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseEnumParam } from '@/shared/lib/http'

const QUOTES_MAX_AGE_SECONDS = 60

/**
 * Quotes of every asset token on a network for 1000 USDC.
 * Query: `chainId` (required, a network with tokens of the asset), `side` (buy | sell, default buy)
 */
export async function getQuotesHandler(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const { searchParams } = request.nextUrl
  const asset = getAssetByTicker(ticker)

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)

  const chainId = parseAssetChainId(asset, searchParams)
  const side = parseEnumParam(searchParams.get('side'), RWA_QUOTE_SIDES, 'buy')

  if (chainId === null || !isSupportedChain(chainId)) {
    return errorResponse(
      400,
      `Invalid "chainId", "${asset.ticker}" has no tokens on chain ${searchParams.get('chainId')}`,
    )
  }
  if (side === null) return errorResponse(400, `Invalid "side", expected one of: ${RWA_QUOTE_SIDES.join(', ')}`)

  try {
    return jsonResponse(await getAssetQuotes(asset, chainId, side), QUOTES_MAX_AGE_SECONDS, 0)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load quotes', error)

    return errorResponse(502, 'Quotes are temporarily unavailable')
  }
}

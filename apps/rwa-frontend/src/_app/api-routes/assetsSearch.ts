import type { RwaAssetsSearchResult } from '@/entities/asset/index.server'
import type { NextRequest } from 'next/server'

import { findAssets } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseIntegerParam } from '@/shared/lib/http'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50
const MAX_QUERY_LENGTH = 64

/**
 * Query: `q` (matches ticker, title or token symbol), `limit` (1..50, default 10)
 */
export async function searchAssetsHandler(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams
  const query = (params.get('q') ?? '').trim()
  const limit = parseIntegerParam(params.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)

  if (!query) return errorResponse(400, 'Missing "q"')
  if (query.length > MAX_QUERY_LENGTH) return errorResponse(400, `"q" is longer than ${MAX_QUERY_LENGTH} chars`)
  if (limit === null) return errorResponse(400, `Invalid "limit", expected 1..${MAX_LIMIT}`)

  const result: RwaAssetsSearchResult = { items: await findAssets(query, limit) }

  return jsonResponse(result, 60)
}

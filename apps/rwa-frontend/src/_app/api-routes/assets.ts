import type { NextRequest } from 'next/server'

import { listAssets } from '@/entities/asset/index.server'
import { RWA_SORT_FIELDS, type RwaSortOrder } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseEnumParam, parseIntegerParam } from '@/shared/lib/http'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const SORT_ORDERS: readonly RwaSortOrder[] = ['asc', 'desc']

/**
 * Query: `page` (1-based, default 1), `pageSize` (1..100, default 20),
 * `sort` (priority | marketCap | change24h | price | ticker, default priority),
 * `order` (asc | desc, default desc; ticker defaults to asc)
 */
export async function getAssetsHandler(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams

  const page = parseIntegerParam(params.get('page'), 1, 1, Number.MAX_SAFE_INTEGER)
  const pageSize = parseIntegerParam(params.get('pageSize'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE)
  const sort = parseEnumParam(params.get('sort'), RWA_SORT_FIELDS, 'priority')
  const order = parseEnumParam(params.get('order'), SORT_ORDERS, sort === 'ticker' ? 'asc' : 'desc')

  if (page === null) return errorResponse(400, 'Invalid "page"')
  if (pageSize === null) return errorResponse(400, `Invalid "pageSize", expected 1..${MAX_PAGE_SIZE}`)
  if (sort === null) return errorResponse(400, `Invalid "sort", expected one of: ${RWA_SORT_FIELDS.join(', ')}`)
  if (order === null) return errorResponse(400, 'Invalid "order", expected asc or desc')

  return jsonResponse(await listAssets({ page, pageSize, sort, order }), 60)
}

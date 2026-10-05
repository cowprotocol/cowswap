import type { NextRequest } from 'next/server'

import { getDefaultSortOrder, listAssets } from '@/entities/asset/index.server'
import {
  RWA_ASSET_TYPES,
  RWA_SORT_FIELDS,
  type RwaAssetsFilter,
  type RwaSortOrder,
} from '@/entities/asset/index.server'
import { errorResponse, jsonResponse, parseEnumParam, parseIntegerParam } from '@/shared/lib/http'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const MAX_QUERY_LENGTH = 64
const MAX_TICKERS = 100
const SORT_ORDERS: readonly RwaSortOrder[] = ['asc', 'desc']

/**
 * Query: `page` (1-based, default 1), `pageSize` (1..100, default 20),
 * `sort` (priority | marketCap | volume24h | change24h | price | ticker | title, default priority),
 * `order` (asc | desc, default desc; ticker and title default to asc),
 * `type` (stock | index), `issuer`, `chainId`, `q` (matches ticker, title or token symbol),
 * `tickers` (comma-separated, up to 100; empty matches nothing)
 */
export async function getAssetsHandler(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams

  const page = parseIntegerParam(params.get('page'), 1, 1, Number.MAX_SAFE_INTEGER)
  const pageSize = parseIntegerParam(params.get('pageSize'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE)
  const sort = parseEnumParam(params.get('sort'), RWA_SORT_FIELDS, 'priority')
  const order = parseEnumParam(params.get('order'), SORT_ORDERS, sort ? getDefaultSortOrder(sort) : 'desc')
  const filter = parseFilter(params)

  if (page === null) return errorResponse(400, 'Invalid "page"')
  if (pageSize === null) return errorResponse(400, `Invalid "pageSize", expected 1..${MAX_PAGE_SIZE}`)
  if (sort === null) return errorResponse(400, `Invalid "sort", expected one of: ${RWA_SORT_FIELDS.join(', ')}`)
  if (order === null) return errorResponse(400, 'Invalid "order", expected asc or desc')
  if (typeof filter === 'string') return errorResponse(400, filter)

  return jsonResponse(await listAssets({ page, pageSize, sort, order, ...filter }), 60)
}

/** The error message when a param is invalid */
function parseFilter(params: URLSearchParams): RwaAssetsFilter | string {
  const type = parseEnumParam(params.get('type'), RWA_ASSET_TYPES, undefined)
  const chainId = parseIntegerParam(params.get('chainId'), undefined, 1, Number.MAX_SAFE_INTEGER)
  const query = params.get('q')?.trim() || undefined
  const tickers = parseTickers(params.get('tickers'))

  if (type === null) return `Invalid "type", expected one of: ${RWA_ASSET_TYPES.join(', ')}`
  if (chainId === null) return 'Invalid "chainId"'
  if (query && query.length > MAX_QUERY_LENGTH) return `"q" is longer than ${MAX_QUERY_LENGTH} chars`
  if (tickers && tickers.length > MAX_TICKERS) return `"tickers" has more than ${MAX_TICKERS} items`

  return { type, chainId, issuer: params.get('issuer') || undefined, query, tickers }
}

function parseTickers(value: string | null): string[] | undefined {
  return value === null ? undefined : value.split(',').filter(Boolean)
}

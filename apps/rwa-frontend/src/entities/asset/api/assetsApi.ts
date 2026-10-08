import type { RwaChartRange, RwaSortField, RwaSortOrder } from '../model/types'

import { RWA_API_PREFIX } from '@/shared/api'

export interface AssetsPageQuery {
  page: number
  pageSize: number
  sort: RwaSortField
  order: RwaSortOrder
}

export function getAssetsSearchUrl(query: string, limit = 10): string {
  const params = new URLSearchParams({ q: query, limit: String(limit) })

  return `${RWA_API_PREFIX}assets-search?${params}`
}

export function getAssetsUrl({ page, pageSize, sort, order }: AssetsPageQuery): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sort, order })

  return `${RWA_API_PREFIX}assets?${params}`
}

export function getAssetUrl(ticker: string): string {
  return `${RWA_API_PREFIX}asset/${encodeURIComponent(ticker)}`
}

export function getChartUrl(ticker: string, range: RwaChartRange): string {
  return `${RWA_API_PREFIX}chart/${encodeURIComponent(ticker)}?range=${range}`
}

export function getTokenListUrl(): string {
  return `${RWA_API_PREFIX}token-list`
}

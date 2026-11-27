import type {
  RwaAssetsFilter,
  RwaChartRange,
  RwaMarketKind,
  RwaQuoteSide,
  RwaSortField,
  RwaSortOrder,
} from '../model/types'

import { RWA_API_PREFIX } from '@/shared/api'

export interface AssetsPageQuery extends RwaAssetsFilter {
  page: number
  pageSize: number
  sort: RwaSortField
  order: RwaSortOrder
}

export function getAssetsSearchUrl(query: string, limit = 10): string {
  const params = new URLSearchParams({ q: query, limit: String(limit) })

  return `${RWA_API_PREFIX}assets-search?${params}`
}

export function getAssetsUrl({
  page,
  pageSize,
  sort,
  order,
  type,
  issuers,
  chainIds,
  minMarketCap,
  minVolume24h,
  query,
  tickers,
}: AssetsPageQuery): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sort, order })

  if (type) params.set('type', type)
  if (issuers?.length) params.set('issuer', issuers.join(','))
  if (chainIds?.length) params.set('chainId', chainIds.join(','))
  if (minMarketCap !== undefined) params.set('minMarketCap', String(minMarketCap))
  if (minVolume24h !== undefined) params.set('minVolume24h', String(minVolume24h))
  if (query) params.set('q', query)
  if (tickers) params.set('tickers', tickers.join(','))

  return `${RWA_API_PREFIX}assets?${params}`
}

export function getAssetUrl(ticker: string): string {
  return `${RWA_API_PREFIX}asset/${encodeURIComponent(ticker)}`
}

export function getCandlesUrl(ticker: string, range: RwaChartRange, market: RwaMarketKind): string {
  return `${RWA_API_PREFIX}candles/${encodeURIComponent(ticker)}?${getChartParams(range, market)}`
}

export function getChartUrl(ticker: string, range: RwaChartRange, market: RwaMarketKind): string {
  return `${RWA_API_PREFIX}chart/${encodeURIComponent(ticker)}?${getChartParams(range, market)}`
}

export function getMarketOverviewUrl(): string {
  return `${RWA_API_PREFIX}market-overview`
}

export function getNewsUrl(ticker: string): string {
  return `${RWA_API_PREFIX}news/${encodeURIComponent(ticker)}`
}

export function getQuotesUrl(ticker: string, chainId: number, side: RwaQuoteSide): string {
  const params = new URLSearchParams({ chainId: String(chainId), side })

  return `${RWA_API_PREFIX}quotes/${encodeURIComponent(ticker)}?${params}`
}

export function getStockUrl(ticker: string): string {
  return `${RWA_API_PREFIX}stock/${encodeURIComponent(ticker)}`
}

export function getTokenListUrl(): string {
  return `${RWA_API_PREFIX}token-list`
}

export function getTokenStatsUrl(ticker: string): string {
  return `${RWA_API_PREFIX}token-stats/${encodeURIComponent(ticker)}`
}

/** `tokenized` is the routes' default, left out so its URLs stay the ones the CDN already caches */
function getChartParams(range: RwaChartRange, market: RwaMarketKind): URLSearchParams {
  const params = new URLSearchParams({ range })

  if (market !== 'tokenized') params.set('market', market)

  return params
}

import { ASSETS_PAGE_SIZE } from './assetsPageAtom'

import type { AssetsFilters } from '../lib/parseAssetsFilters'
import type { AssetsPageQuery, RwaSortField, RwaSortOrder } from '@/entities/asset'

export interface AssetsSortState {
  sort: RwaSortField
  order: RwaSortOrder
}

export type PanelFilters = Pick<AssetsFilters, 'issuers' | 'chainIds' | 'minMarketCap' | 'minVolume24h'>

interface AssetsPageQueryState {
  filters: AssetsFilters
  page: number
  sort: AssetsSortState
  query: string
  watchlist: string[]
}

export const NO_PANEL_FILTERS: PanelFilters = { issuers: [], chainIds: [], minMarketCap: null, minVolume24h: null }

export const DEFAULT_ASSETS_FILTERS: AssetsFilters = { type: null, ...NO_PANEL_FILTERS, watchlistOnly: false }

export const DEFAULT_ASSETS_SORT: AssetsSortState = { sort: 'volume24h', order: 'desc' }

export function toAssetsPageQuery({ filters, page, sort, query, watchlist }: AssetsPageQueryState): AssetsPageQuery {
  const { type, issuers, chainIds, minMarketCap, minVolume24h, watchlistOnly } = filters

  return {
    page,
    pageSize: ASSETS_PAGE_SIZE,
    ...sort,
    type: type ?? undefined,
    issuers: issuers.length ? [...issuers].sort() : undefined,
    chainIds: chainIds.length ? [...chainIds].sort((a, b) => a - b) : undefined,
    minMarketCap: minMarketCap ?? undefined,
    minVolume24h: minVolume24h ?? undefined,
    query: query || undefined,
    tickers: watchlistOnly ? [...watchlist].sort() : undefined,
  }
}

/** The table query before stored filters, sorting and watchlist load, which the server renders */
export const DEFAULT_ASSETS_PAGE_QUERY = toAssetsPageQuery({
  filters: DEFAULT_ASSETS_FILTERS,
  page: 1,
  sort: DEFAULT_ASSETS_SORT,
  query: '',
  watchlist: [],
})

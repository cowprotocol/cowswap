import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsFiltersAtom, debouncedAssetsFilterQueryAtom } from './assetsFiltersAtoms'
import { ASSETS_PAGE_SIZE, assetsPageAtom } from './assetsPageAtom'
import { assetsSortAtom } from './assetsSortAtom'
import { watchlistAtom } from './watchlistAtoms'

import { assetsPageQueryOptions } from '@/entities/asset'

export const assetsPageQueryAtom = atomWithQuery((get) => {
  const { type, issuers, chainIds, minMarketCap, minVolume24h, watchlistOnly } = get(assetsFiltersAtom)

  return assetsPageQueryOptions({
    page: get(assetsPageAtom),
    pageSize: ASSETS_PAGE_SIZE,
    ...get(assetsSortAtom),
    type: type ?? undefined,
    issuers: issuers.length ? [...issuers].sort() : undefined,
    chainIds: chainIds.length ? [...chainIds].sort((a, b) => a - b) : undefined,
    minMarketCap: minMarketCap ?? undefined,
    minVolume24h: minVolume24h ?? undefined,
    query: get(debouncedAssetsFilterQueryAtom) || undefined,
    tickers: watchlistOnly ? [...get(watchlistAtom)].sort() : undefined,
  })
})

import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsFiltersAtom, debouncedAssetsFilterQueryAtom } from './assetsFiltersAtoms'
import { ASSETS_PAGE_SIZE, assetsPageAtom } from './assetsPageAtom'
import { assetsSortAtom } from './assetsSortAtom'
import { watchlistAtom } from './watchlistAtoms'

import { assetsPageQueryOptions } from '@/entities/asset'

export const assetsPageQueryAtom = atomWithQuery((get) => {
  const { type, issuer, chainId, watchlistOnly } = get(assetsFiltersAtom)

  return assetsPageQueryOptions({
    page: get(assetsPageAtom),
    pageSize: ASSETS_PAGE_SIZE,
    ...get(assetsSortAtom),
    type: type ?? undefined,
    issuer: issuer ?? undefined,
    chainId: chainId ?? undefined,
    query: get(debouncedAssetsFilterQueryAtom) || undefined,
    tickers: watchlistOnly ? [...get(watchlistAtom)].sort() : undefined,
  })
})

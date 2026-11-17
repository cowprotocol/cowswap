import { atom } from 'jotai'

import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsFiltersAtom, debouncedAssetsFilterQueryAtom } from './assetsFiltersAtoms'
import { assetsPageAtom } from './assetsPageAtom'
import { toAssetsPageQuery } from './assetsPageQuery'
import { assetsSortAtom } from './assetsSortAtom'
import { watchlistAtom } from './watchlistAtoms'

import { assetsPageQueryOptions } from '@/entities/asset'

export const assetsPageQueryAtom = atomWithQuery((get) =>
  assetsPageQueryOptions(
    toAssetsPageQuery({
      filters: get(assetsFiltersAtom),
      page: get(assetsPageAtom),
      sort: get(assetsSortAtom),
      query: get(debouncedAssetsFilterQueryAtom),
      watchlist: get(watchlistAtom),
    }),
  ),
)

export const assetsCountLabelAtom = atom((get) => {
  const { data } = get(assetsPageQueryAtom)

  return data && `${data.total} ${data.total === 1 ? 'asset' : 'assets'}`
})

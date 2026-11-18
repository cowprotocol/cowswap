import { atom } from 'jotai'

import { hashKey } from '@tanstack/query-core'

import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsFiltersAtom, debouncedAssetsFilterQueryAtom, readStoredAssetsFilters } from './assetsFiltersAtoms'
import { assetsPageAtom } from './assetsPageAtom'
import { DEFAULT_ASSETS_PAGE_QUERY, toAssetsPageQuery } from './assetsPageQuery'
import { assetsSortAtom, readStoredAssetsSort } from './assetsSortAtom'
import { readStoredWatchlist, watchlistAtom } from './watchlistAtoms'

import { assetsPageQueryOptions, type RwaAssetsPage } from '@/entities/asset'

const DEFAULT_ASSETS_PAGE_QUERY_HASH = hashKey(assetsPageQueryOptions(DEFAULT_ASSETS_PAGE_QUERY).queryKey)

/**
 * The query of the stored filters, sort and watchlist, read once per store. The server renders the default query, and
 * the stored state replaces it after hydration: the default rows must not stand in for it while it loads
 */
const storedAssetsPageQueryHashAtom = atom(() =>
  hashKey(
    assetsPageQueryOptions(
      toAssetsPageQuery({
        filters: readStoredAssetsFilters(),
        page: 1,
        sort: readStoredAssetsSort(),
        query: '',
        watchlist: readStoredWatchlist(),
      }),
    ).queryKey,
  ),
)

export const assetsPageQueryAtom = atomWithQuery((get) => {
  const options = assetsPageQueryOptions(
    toAssetsPageQuery({
      filters: get(assetsFiltersAtom),
      page: get(assetsPageAtom),
      sort: get(assetsSortAtom),
      query: get(debouncedAssetsFilterQueryAtom),
      watchlist: get(watchlistAtom),
    }),
  )
  const isStoredQuery = hashKey(options.queryKey) === get(storedAssetsPageQueryHashAtom)

  return {
    ...options,
    placeholderData: (previousData: RwaAssetsPage | undefined, previousQuery?: { queryHash: string }) =>
      isStoredQuery && previousQuery?.queryHash === DEFAULT_ASSETS_PAGE_QUERY_HASH ? undefined : previousData,
  }
})

export const assetsCountLabelAtom = atom((get) => {
  const { data } = get(assetsPageQueryAtom)

  return data && `${data.total} ${data.total === 1 ? 'asset' : 'assets'}`
})

import { useAtomValue } from 'jotai'

import { useDebounce } from '@cowprotocol/common-hooks/useDebounce'

import useSWR from 'swr'

import { assetsSearchQueryAtom } from '../model/assetsSearchQueryAtom'

import { getAssetsSearchUrl, type RwaAssetsSearchResult, type RwaAssetWithMarket } from '@/entities/asset'

const SEARCH_DEBOUNCE_MS = 300

export interface AssetsSearchState {
  query: string
  items: RwaAssetWithMarket[] | undefined
  error: Error | undefined
  isLoading: boolean
}

export function useAssetsSearch(): AssetsSearchState {
  const query = useDebounce(useAtomValue(assetsSearchQueryAtom).trim(), SEARCH_DEBOUNCE_MS)
  const { data, error, isLoading } = useSWR<RwaAssetsSearchResult, Error>(query ? getAssetsSearchUrl(query) : null)

  return { query, items: data?.items, error, isLoading }
}

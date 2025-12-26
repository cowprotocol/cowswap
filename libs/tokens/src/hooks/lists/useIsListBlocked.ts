import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { restrictedListsAtom } from '../../state/restrictedTokens/restrictedTokensAtom'

export function normalizeListSource(source: string): string {
  return source.toLowerCase().trim()
}

export interface ListBlockedResult {
  isBlocked: boolean
  isLoading: boolean
}

/**
 * check if a token list is blocked for the given country
 */
export function useIsListBlocked(listSource: string | undefined, country: string | null): ListBlockedResult {
  const restrictedLists = useAtomValue(restrictedListsAtom)

  return useMemo(() => {
    if (!listSource || !restrictedLists.isLoaded) {
      return { isBlocked: false, isLoading: !restrictedLists.isLoaded }
    }

    if (!country) {
      return { isBlocked: false, isLoading: false }
    }

    const blockedCountries = restrictedLists.blockedCountriesPerList[normalizeListSource(listSource)]

    if (!blockedCountries) {
      return { isBlocked: false, isLoading: false }
    }

    const countryUpper = country.toUpperCase()
    const isBlocked = blockedCountries.includes(countryUpper)
    return { isBlocked, isLoading: false }
  }, [listSource, country, restrictedLists])
}

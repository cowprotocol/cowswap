import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { restrictedListsAtom } from '../../state/restrictedTokens/restrictedTokensAtom'

export function getSourceAsKey(source: string): string {
  return source.toLowerCase().trim()
}

export function getCountryAsKey(country: string): string {
  return country.toUpperCase()
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

    const blockedCountries = restrictedLists.blockedCountriesPerList[getSourceAsKey(listSource)]

    if (!blockedCountries) {
      return { isBlocked: false, isLoading: false }
    }

    const isBlocked = blockedCountries.includes(getCountryAsKey(country))
    return { isBlocked, isLoading: false }
  }, [listSource, country, restrictedLists])
}

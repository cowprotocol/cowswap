import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { normalizeListSource } from './useIsListBlocked'

import { restrictedListsAtom } from '../../state/restrictedTokens/restrictedTokensAtom'
import { ListState } from '../../types'

/**
 * filter out token lists that are blocked for the given country
 */
export function useFilterBlockedLists(lists: ListState[], country: string | null): ListState[] {
  const restrictedLists = useAtomValue(restrictedListsAtom)

  return useMemo(() => {
    if (!country || !restrictedLists.isLoaded) {
      return lists
    }

    const countryUpper = country.toUpperCase()

    return lists.filter((list) => {
      const blockedCountries = restrictedLists.blockedCountriesPerList[normalizeListSource(list.source)]

      if (!blockedCountries) {
        return true
      }

      return !blockedCountries.includes(countryUpper)
    })
  }, [lists, country, restrictedLists])
}

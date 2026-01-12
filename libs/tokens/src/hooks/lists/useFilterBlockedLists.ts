import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getCountryAsKey, getSourceAsKey } from './useIsListBlocked'

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

    const countryKey = getCountryAsKey(country)

    return lists.filter((list) => {
      const blockedCountries = restrictedLists.blockedCountriesPerList[getSourceAsKey(list.source)]

      if (!blockedCountries) {
        return true
      }

      return !blockedCountries.includes(countryKey)
    })
  }, [lists, country, restrictedLists])
}

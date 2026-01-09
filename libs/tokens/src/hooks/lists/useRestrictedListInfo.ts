import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getSourceAsKey } from './useIsListBlocked'

import { restrictedListsAtom } from '../../state/restrictedTokens/restrictedTokensAtom'

export interface RestrictedListInfo {
  source: string
  blockedCountries: string[]
  consentHash: string
}

export function useRestrictedListInfo(listSource: string | undefined): RestrictedListInfo | null {
  const restrictedLists = useAtomValue(restrictedListsAtom)

  return useMemo(() => {
    if (!listSource || !restrictedLists.isLoaded) {
      return null
    }

    const sourceKey = getSourceAsKey(listSource)
    const blockedCountries = restrictedLists.blockedCountriesPerList[sourceKey]
    const consentHash = restrictedLists.consentHashPerList[sourceKey]

    if (!blockedCountries || !consentHash) {
      return null
    }

    return {
      source: sourceKey,
      blockedCountries,
      consentHash,
    }
  }, [listSource, restrictedLists])
}

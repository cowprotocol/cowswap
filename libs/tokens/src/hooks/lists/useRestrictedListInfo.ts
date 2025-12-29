import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { normalizeListSource } from './useIsListBlocked'

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

    const normalizedSource = normalizeListSource(listSource)
    const blockedCountries = restrictedLists.blockedCountriesPerList[normalizedSource]
    const consentHash = restrictedLists.consentHashPerList[normalizedSource]

    if (!blockedCountries || !consentHash) {
      return null
    }

    return {
      source: normalizedSource,
      blockedCountries,
      consentHash,
    }
  }, [listSource, restrictedLists])
}

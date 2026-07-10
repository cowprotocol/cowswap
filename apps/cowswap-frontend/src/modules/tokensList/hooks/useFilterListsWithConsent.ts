import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getSourceAsKey, ListState, restrictedListsAtom, useFilterBlockedLists } from '@cowprotocol/tokens'

import { useGeoStatus } from 'modules/rwa'

/**
 * filters token lists that should not be visible:
 * 1. lists blocked for the users country (when country is known)
 * 2. restricted lists when country is unknown
 */
export function useFilterListsWithConsent(lists: ListState[]): ListState[] {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)

  // First, filter by country if known
  const countryFilteredLists = useFilterBlockedLists(lists, geoStatus.country)

  return useMemo(() => {
    if (isRwaGeoblockEnabled === false) {
      return lists
    }

    if (isRwaGeoblockEnabled !== true || !restrictedLists.isLoaded) {
      return []
    }

    // If country is known, just return country-filtered lists
    if (geoStatus.country) {
      return countryFilteredLists
    }

    return countryFilteredLists.filter((list): boolean => {
      const sourceKey = getSourceAsKey(list.source)
      const hasBlockedCountries = Boolean(restrictedLists.blockedCountriesPerList[sourceKey]?.length)
      const hasConsentHash = Boolean(restrictedLists.consentHashPerList[sourceKey])

      return !hasBlockedCountries && !hasConsentHash
    })
  }, [countryFilteredLists, geoStatus.country, isRwaGeoblockEnabled, lists, restrictedLists])
}

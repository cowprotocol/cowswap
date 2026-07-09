import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { blockedListSourcesAtom, getCountryAsKey, restrictedListsAtom } from '@cowprotocol/tokens'

import { useGeoStatus } from 'modules/rwa'

/**
 * Keeps restricted token lists hidden until geoblocking checks are satisfied.
 */
export function BlockedListSourcesUpdater(): null {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const setBlockedListSources = useSetAtom(blockedListSourcesAtom)

  useEffect(() => {
    if (isRwaGeoblockEnabled === false) {
      setBlockedListSources(new Set<string>())
      return
    }

    if (isRwaGeoblockEnabled !== true || !restrictedLists.isLoaded) {
      return
    }

    const blockedSources = new Set<string>()

    const sourceKeys = new Set([
      ...Object.keys(restrictedLists.blockedCountriesPerList),
      ...Object.keys(restrictedLists.consentHashPerList),
    ])

    for (const sourceKey of sourceKeys) {
      const blockedCountries = restrictedLists.blockedCountriesPerList[sourceKey] ?? []

      if (geoStatus.country) {
        const countryKey = getCountryAsKey(geoStatus.country)

        if (blockedCountries.includes(countryKey)) {
          blockedSources.add(sourceKey)
        }

        continue
      }

      blockedSources.add(sourceKey)
    }

    setBlockedListSources(blockedSources)
  }, [geoStatus.country, isRwaGeoblockEnabled, restrictedLists, setBlockedListSources])

  return null
}

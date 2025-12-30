import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { blockedListSourcesAtom, getCountryAsKey, restrictedListsAtom } from '@cowprotocol/tokens'

import { useGeoStatus } from 'modules/rwa'

/**
 * update the blockedListSourcesAtom based on geo-blocking only:
 * - only blocks lists when country is known and the list is blocked for that country
 * - does not block when country is unknown (consent check happens at trade/import time)
 */
export function BlockedListSourcesUpdater(): null {
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const setBlockedListSources = useSetAtom(blockedListSourcesAtom)

  useEffect(() => {
    if (!restrictedLists.isLoaded) {
      return
    }

    const blockedSources = new Set<string>()

    // only block when country is known and list is blocked for that country
    // when country is unknown, tokens should be visible (consent check happens at trade time)
    if (geoStatus.country) {
      const countryKey = getCountryAsKey(geoStatus.country)

      for (const [sourceKey, blockedCountries] of Object.entries(restrictedLists.blockedCountriesPerList)) {
        if (blockedCountries.includes(countryKey)) {
          blockedSources.add(sourceKey)
        }
      }
    }

    setBlockedListSources(blockedSources)
  }, [geoStatus, restrictedLists, setBlockedListSources])

  return null
}

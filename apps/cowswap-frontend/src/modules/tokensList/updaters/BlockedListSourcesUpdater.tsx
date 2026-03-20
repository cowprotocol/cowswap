import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { blockedListSourcesAtom, getCountryAsKey, restrictedListsAtom } from '@cowprotocol/tokens'

import { useGeoStatus } from 'modules/rwa'

/**
 * update the blockedListSourcesAtom based on geo-blocking only:
 * - only blocks lists when country is known and the list is blocked for that country
 * - does not block when country is unknown (consent check happens at trade/import time)
 */
export function BlockedListSourcesUpdater(): null {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const { country } = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const setBlockedListSources = useSetAtom(blockedListSourcesAtom)
  const lastBlockedRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip blocking if feature flag is disabled
    if (!isRwaGeoblockEnabled) {
      const key = ''
      if (lastBlockedRef.current !== key) {
        lastBlockedRef.current = key
        setBlockedListSources(new Set<string>())
      }
      return
    }

    if (!restrictedLists.isLoaded) {
      return
    }

    const blockedSources = new Set<string>()

    // only block when country is known and list is blocked for that country
    // when country is unknown, tokens should be visible (consent check happens at trade time)
    if (country) {
      const countryKey = getCountryAsKey(country)

      for (const [sourceKey, blockedCountries] of Object.entries(restrictedLists.blockedCountriesPerList)) {
        if (blockedCountries.includes(countryKey)) {
          blockedSources.add(sourceKey)
        }
      }
    }

    const key = [...blockedSources].sort().join(',')
    if (lastBlockedRef.current !== key) {
      lastBlockedRef.current = key
      setBlockedListSources(blockedSources)
    }
  }, [
    isRwaGeoblockEnabled,
    country,
    restrictedLists.isLoaded,
    restrictedLists.blockedCountriesPerList,
    setBlockedListSources,
  ])

  return null
}

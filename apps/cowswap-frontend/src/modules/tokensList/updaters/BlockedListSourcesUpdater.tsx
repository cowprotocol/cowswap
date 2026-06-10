import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { blockedListSourcesAtom, getCountryAsKey, restrictedListsAtom } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, rwaConsentCacheAtom, RwaConsentKey, useGeoStatus } from 'modules/rwa'

/**
 * Keeps restricted token lists hidden until geoblocking checks are satisfied.
 */
export function BlockedListSourcesUpdater(): null {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)
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

    for (const [sourceKey, blockedCountries] of Object.entries(restrictedLists.blockedCountriesPerList)) {
      if (geoStatus.country) {
        const countryKey = getCountryAsKey(geoStatus.country)

        if (blockedCountries.includes(countryKey)) {
          blockedSources.add(sourceKey)
        }

        continue
      }

      const consentHash = restrictedLists.consentHashPerList[sourceKey]

      if (!consentHash) {
        continue
      }

      if (!account) {
        blockedSources.add(sourceKey)
        continue
      }

      const consentKey: RwaConsentKey = {
        wallet: account,
        ipfsHash: consentHash,
      }

      if (!getConsentFromCache(consentCache, consentKey)?.acceptedAt) {
        blockedSources.add(sourceKey)
      }
    }

    setBlockedListSources(blockedSources)
  }, [account, consentCache, geoStatus.country, isRwaGeoblockEnabled, restrictedLists, setBlockedListSources])

  return null
}

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { ListState, normalizeListSource, restrictedListsAtom, useFilterBlockedLists } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, rwaConsentCacheAtom, RwaConsentKey, useGeoStatus } from 'modules/rwa'

/**
 * filters token lists that should not be visible:
 * 1. lists blocked for the users country (when country is known)
 * 2. restricted lists when country is unknown and consent is not given
 */
export function useFilterListsWithConsent(lists: ListState[]): ListState[] {
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  // First, filter by country if known
  const countryFilteredLists = useFilterBlockedLists(lists, geoStatus.country)

  return useMemo(() => {
    // If country is known, just return country-filtered lists
    if (geoStatus.country) {
      return countryFilteredLists
    }

    // If geo is still loading, return all lists for now
    if (geoStatus.isLoading) {
      return countryFilteredLists
    }

    // if restricted lists not loaded, return all
    if (!restrictedLists.isLoaded) {
      return countryFilteredLists
    }

    return countryFilteredLists.filter((list) => {
      const normalizedSource = normalizeListSource(list.source)
      const consentHash = restrictedLists.consentHashPerList[normalizedSource]

      if (!consentHash) {
        return true
      }

      if (!account) {
        // no wallet connected - hide restricted lists
        return false
      }

      const consentKey: RwaConsentKey = { wallet: account, ipfsHash: consentHash }
      const existingConsent = getConsentFromCache(consentCache, consentKey)

      // Only show if consent is given
      return !!existingConsent?.acceptedAt
    })
  }, [countryFilteredLists, geoStatus, restrictedLists, account, consentCache])
}

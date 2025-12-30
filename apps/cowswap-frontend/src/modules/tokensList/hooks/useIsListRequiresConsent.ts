import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getSourceAsKey, restrictedListsAtom } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, rwaConsentCacheAtom, RwaConsentKey, useGeoStatus } from 'modules/rwa'

export interface ListConsentResult {
  requiresConsent: Boolean
  consentHash: string | null
  isLoading: boolean
}

// check if a list requires consent before it can be shown/imported
export function useIsListRequiresConsent(listSource: string | undefined): ListConsentResult {
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  return useMemo(() => {
    // If no source, no consent required
    if (!listSource) {
      return { requiresConsent: false, consentHash: null, isLoading: false }
    }

    // If still loading, return loading state
    if (!restrictedLists.isLoaded || geoStatus.isLoading) {
      return { requiresConsent: false, consentHash: null, isLoading: true }
    }

    const sourceKey = getSourceAsKey(listSource)
    const consentHash = restrictedLists.consentHashPerList[sourceKey]

    // If list is not restricted, no consent required
    if (!consentHash) {
      return { requiresConsent: false, consentHash: null, isLoading: false }
    }

    // If country is known, no consent check needed (blocked check happens elsewhere)
    if (geoStatus.country) {
      return { requiresConsent: false, consentHash, isLoading: false }
    }

    // Country is unknown - check if consent is given
    // If no wallet connected, don't block - the consent modal will handle wallet connection
    if (!account) {
      return { requiresConsent: false, consentHash, isLoading: false }
    }

    const consentKey: RwaConsentKey = { wallet: account, ipfsHash: consentHash }
    const existingConsent = getConsentFromCache(consentCache, consentKey)

    // Consent required if not already given
    return {
      requiresConsent: !existingConsent?.acceptedAt,
      consentHash,
      isLoading: false,
    }
  }, [listSource, restrictedLists, geoStatus, account, consentCache])
}

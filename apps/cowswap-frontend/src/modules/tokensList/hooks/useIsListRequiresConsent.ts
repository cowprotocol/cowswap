import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isRwaTokenListSource } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, RWA_CONSENT_HASH, rwaConsentCacheAtom, RwaConsentKey, useGeoStatus } from 'modules/rwa'

export interface ListConsentResult {
  requiresConsent: boolean
  consentHash: string | null
  isLoading: boolean
}

// check if a list requires consent before it can be shown/imported
export function useIsListRequiresConsent(listSource: string | undefined): ListConsentResult {
  const { account } = useWalletInfo()
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const geoStatus = useGeoStatus()
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  return useMemo(() => {
    // skip consent check if ff is disabled
    if (!isRwaGeoblockEnabled) {
      return { requiresConsent: false, consentHash: null, isLoading: false }
    }

    // If no source, no consent required
    if (!listSource) {
      return { requiresConsent: false, consentHash: null, isLoading: false }
    }

    // If still loading, return loading state
    if (geoStatus.isLoading) {
      return { requiresConsent: false, consentHash: null, isLoading: true }
    }

    if (!isRwaTokenListSource(listSource)) {
      return { requiresConsent: false, consentHash: null, isLoading: false }
    }

    const consentHash = RWA_CONSENT_HASH

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
  }, [isRwaGeoblockEnabled, listSource, geoStatus, account, consentCache])
}

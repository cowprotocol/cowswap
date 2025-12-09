import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  getConsentFromCache,
  removeRwaConsentAtom,
  rwaConsentCacheAtom,
  storeRwaConsentAtom,
} from '../state/rwaConsentAtom'
import { GeoMode, RwaConsentKey, RwaConsentRecord } from '../types/rwaConsent'

export type RwaConsentStatus = 'none' | 'valid'

export interface UseRwaConsentStatusReturn {
  consentStatus: RwaConsentStatus
  consentRecord: RwaConsentRecord | undefined
  confirmConsent: (geoMode: GeoMode) => void
  resetConsent: () => void
}

export function useRwaConsentStatus(key: RwaConsentKey): UseRwaConsentStatusReturn {
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const storeConsent = useSetAtom(storeRwaConsentAtom)
  const removeConsent = useSetAtom(removeRwaConsentAtom)

  const consentRecord = useMemo(() => {
    if (!key.wallet || !key.issuer || !key.tosVersion) {
      return undefined
    }
    return getConsentFromCache(consentCache, key)
  }, [consentCache, key])

  const consentStatus: RwaConsentStatus = consentRecord?.confirmed ? 'valid' : 'none'

  const confirmConsent = useCallback(
    (geoMode: GeoMode) => {
      if (!key.wallet || !key.issuer || !key.tosVersion) {
        return
      }
      storeConsent({ ...key, geoMode })
    },
    [storeConsent, key],
  )

  const resetConsent = useCallback(() => {
    if (!key.wallet || !key.issuer || !key.tosVersion) {
      return
    }
    removeConsent(key)
  }, [removeConsent, key])

  return {
    consentStatus,
    consentRecord,
    confirmConsent,
    resetConsent,
  }
}

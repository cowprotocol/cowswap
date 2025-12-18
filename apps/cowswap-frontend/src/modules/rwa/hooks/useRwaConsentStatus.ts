import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  getConsentFromCache,
  removeRwaConsentAtom,
  rwaConsentCacheAtom,
  storeRwaConsentAtom,
} from '../state/rwaConsentAtom'
import { RwaConsentKey, RwaConsentRecord } from '../types/rwaConsent'

export type RwaConsentStatus = 'none' | 'valid'

export interface UseRwaConsentStatusReturn {
  consentStatus: RwaConsentStatus
  consentRecord: RwaConsentRecord | undefined
  confirmConsent: () => void
  resetConsent: () => void
}

export function useRwaConsentStatus(key: RwaConsentKey | null): UseRwaConsentStatusReturn {
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const storeConsent = useSetAtom(storeRwaConsentAtom)
  const removeConsent = useSetAtom(removeRwaConsentAtom)

  const consentRecord = useMemo(() => {
    if (!key) {
      return undefined
    }
    return getConsentFromCache(consentCache, key)
  }, [consentCache, key])

  const consentStatus: RwaConsentStatus = consentRecord?.acceptedAt ? 'valid' : 'none'

  const confirmConsent = useCallback(() => {
    if (!key) {
      return
    }
    storeConsent(key)
  }, [storeConsent, key])

  const resetConsent = useCallback(() => {
    if (!key) {
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

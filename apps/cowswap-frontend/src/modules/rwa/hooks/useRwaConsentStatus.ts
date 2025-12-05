import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { createRwaConsentStatusAtom, getRwaConsentAtom } from '../state/rwaConsentAtom'
import { GeoMode, RwaConsentKey } from '../types/rwaConsent'

export type RwaConsentStatus = 'none' | 'valid'

export interface UseRwaConsentStatusReturn {
  consentStatus: RwaConsentStatus
  confirmConsent: (geoMode: GeoMode) => void
  resetConsent: () => void
}

export function useRwaConsentStatus(key: RwaConsentKey): UseRwaConsentStatusReturn {
  const consentAtom = getRwaConsentAtom(key)
  const statusAtom = createRwaConsentStatusAtom(key)
  
  const setConsent = useSetAtom(consentAtom)
  const consentStatus = useAtomValue(statusAtom)

  const confirmConsent = useCallback(
    (geoMode: GeoMode) => {
      setConsent({
        confirmed: true,
        geoMode,
        confirmedAt: Date.now(),
      })
    },
    [setConsent],
  )

  const resetConsent = useCallback(() => {
    setConsent({
      confirmed: false,
      geoMode: 'UNKNOWN',
      confirmedAt: 0,
    })
  }, [setConsent])

  return {
    consentStatus,
    confirmConsent,
    resetConsent,
  }
}


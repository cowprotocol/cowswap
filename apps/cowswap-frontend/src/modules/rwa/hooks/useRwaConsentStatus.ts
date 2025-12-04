import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

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
  const statusAtom = useMemo(() => createRwaConsentStatusAtom(key), [key])
  
  const [, setConsent] = useAtom(consentAtom)
  const consentStatus = useAtomValue(statusAtom)

  const confirmConsent = useCallback(
    (geoMode: GeoMode) => {
      setConsent({
        confirmed: true,
        geoMode,
        confirmedAt: Date.now(),
      })
    },
    [setConsent]
  )

  const resetConsent = useCallback(() => {
    setConsent({
      confirmed: false,
      geoMode: 'UNKNOWN',
      confirmedAt: 0,
    })
  }, [setConsent])

  return useMemo(
    () => ({
      consentStatus,
      confirmConsent,
      resetConsent,
    }),
    [consentStatus, confirmConsent, resetConsent]
  )
}


import { useCallback, useMemo, useState, useRef, ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaSelfCertificationModal } from '../components/RwaSelfCertificationModal/RwaSelfCertificationModal'
import { GeoMode, RwaConsentKey } from '../types/rwaConsent'

export interface UseRwaSelfCertificationParams {
  issuer: string
  tosVersion: string
  geoMode: GeoMode
  title?: string
  description?: string
  warning?: string
  issuerName?: string
}

export interface UseRwaSelfCertificationReturn {
  showModal: () => Promise<boolean>
  ModalComponent: () => ReactNode
}

const DEFAULT_TITLE = 'RWA Token Self-Certification Required'
const DEFAULT_DESCRIPTION =
  'Your IP address could not be determined (VPN, privacy settings, etc.). To trade RWA-restricted tokens, you must confirm that you are not a US person, EU resident, or resident in a sanctioned country.'
const DEFAULT_WARNING = 'By confirming, you acknowledge that you meet the eligibility requirements for trading RWA tokens.'

export function useRwaSelfCertification({
  issuer,
  tosVersion,
  geoMode,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  warning = DEFAULT_WARNING,
  issuerName,
}: UseRwaSelfCertificationParams): UseRwaSelfCertificationReturn {
  const { account } = useWalletInfo()
  const [isOpen, setIsOpen] = useState(false)
  const resolvePromiseRef = useRef<((value: boolean) => void) | null>(null)

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!account) {
      return null
    }
    return {
      wallet: account,
      issuer,
      tosVersion,
    }
  }, [account, issuer, tosVersion])

  const { consentStatus, confirmConsent } = useRwaConsentStatus(
    consentKey || { wallet: '', issuer, tosVersion }
  )

  const showModal = useCallback((): Promise<boolean> => {
    if (!account || !consentKey) {
      return Promise.resolve(false)
    }

    if (consentStatus === 'valid') {
      return Promise.resolve(true)
    }

    return new Promise((resolve) => {
      resolvePromiseRef.current = resolve
      setIsOpen(true)
    })
  }, [account, consentKey, consentStatus])

  const handleConfirm = useCallback(() => {
    if (!consentKey) {
      return
    }
    confirmConsent(geoMode)
    setIsOpen(false)
    if (resolvePromiseRef.current) {
      resolvePromiseRef.current(true)
      resolvePromiseRef.current = null
    }
  }, [confirmConsent, geoMode, consentKey])

  const handleDismiss = useCallback(() => {
    setIsOpen(false)
    if (resolvePromiseRef.current) {
      resolvePromiseRef.current(false)
      resolvePromiseRef.current = null
    }
  }, [])

  const ModalComponent = useCallback(
    () => (
      <RwaSelfCertificationModal
        isOpen={isOpen}
        title={title}
        description={description}
        warning={warning}
        issuerName={issuerName}
        tosVersion={tosVersion}
        onDismiss={handleDismiss}
        onConfirm={handleConfirm}
      />
    ),
    [isOpen, title, description, warning, issuerName, tosVersion, handleDismiss, handleConfirm]
  )

  return useMemo(
    () => ({
      showModal,
      ModalComponent,
    }),
    [showModal, ModalComponent]
  )
}

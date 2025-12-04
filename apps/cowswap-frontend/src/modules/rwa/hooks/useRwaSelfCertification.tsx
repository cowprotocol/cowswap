import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaSelfCertificationModal } from '../components/RwaSelfCertificationModal'
import { GeoMode, RwaConsentKey } from '../types/rwaConsent'
import { useDialogModal } from '../utils/useDialogModal'

export interface UseRwaSelfCertificationParams {
  issuer: string
  tosVersion: string
  geoMode: GeoMode
  issuerName?: string
}

export interface UseRwaSelfCertificationReturn {
  showModal: () => Promise<boolean>
  ModalComponent: () => ReactNode
}

function createConsentKey(account: string | undefined, issuer: string, tosVersion: string): RwaConsentKey {
  return account ? { wallet: account, issuer, tosVersion } : { wallet: '', issuer, tosVersion }
}

export function useRwaSelfCertification({
  issuer,
  tosVersion,
  geoMode,
  issuerName,
}: UseRwaSelfCertificationParams): UseRwaSelfCertificationReturn {
  const { account } = useWalletInfo()
  const { isOpen, openModal, onAccept, closeModal } = useDialogModal()

  const consentKey = useMemo(() => createConsentKey(account, issuer, tosVersion), [account, issuer, tosVersion])

  const { consentStatus, confirmConsent } = useRwaConsentStatus(consentKey)

  const handleConfirm = useCallback(() => {
    if (!consentKey) {
      return
    }
    confirmConsent(geoMode)
    onAccept()
  }, [confirmConsent, geoMode, consentKey, onAccept])

  const ModalComponent = useCallback(
    () => (
      <RwaSelfCertificationModal
        isOpen={isOpen}
        issuerName={issuerName}
        tosVersion={tosVersion}
        onDismiss={closeModal}
        onConfirm={handleConfirm}
      />
    ),
    [isOpen, issuerName, tosVersion, closeModal, handleConfirm],
  )

  const showModal = useCallback(async (): Promise<boolean> => {
    if (!account || !consentKey) {
      return false
    }

    if (consentStatus === 'valid') {
      return true
    }

    return openModal()
  }, [account, consentKey, consentStatus, openModal])

  return {
    showModal,
    ModalComponent,
  }
}

import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { geoStatusToGeoMode, useGeoStatus } from 'modules/rwa/hooks/useGeoStatus'
import { useRwaConsentModalState } from 'modules/rwa/hooks/useRwaConsentModalState'
import { useRwaConsentStatus } from 'modules/rwa/hooks/useRwaConsentStatus'
import { RwaConsentModal } from 'modules/rwa/pure/RwaConsentModal'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'
import { useTradeConfirmActions } from 'modules/trade'

export function RwaConsentModalContainer(): ReactNode {
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const { isModalOpen, closeModal, context } = useRwaConsentModalState()
  const tradeConfirmActions = useTradeConfirmActions()

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!context || !account) {
      return null
    }
    return {
      wallet: account,
      issuer: context.issuer,
      tosVersion: context.tosVersion,
    }
  }, [context, account])

  // Only call useRwaConsentStatus when we have a valid consentKey
  const { confirmConsent } = useRwaConsentStatus(
    consentKey || { wallet: '', issuer: '', tosVersion: '' },
  )

  const onDismiss = useCallback(() => {
    closeModal()
  }, [closeModal])

  const onConfirm = useCallback(() => {
    if (!account || !context || !consentKey) {
      return
    }

    confirmConsent(geoStatusToGeoMode(geoStatus))
    closeModal()
    tradeConfirmActions.onOpen()
  }, [account, context, consentKey, confirmConsent, geoStatus, closeModal, tradeConfirmActions])

  if (!isModalOpen || !context) {
    return null
  }

  return <RwaConsentModal onDismiss={onDismiss} onConfirm={onConfirm} />
}


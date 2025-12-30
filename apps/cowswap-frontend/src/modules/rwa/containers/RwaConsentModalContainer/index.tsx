import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeConfirmActions } from 'modules/trade'

import { useRwaConsentModalState } from '../../hooks/useRwaConsentModalState'
import { useRwaConsentStatus } from '../../hooks/useRwaConsentStatus'
import { RwaConsentModal } from '../../pure/RwaConsentModal'
import { RwaConsentKey } from '../../types/rwaConsent'

export function RwaConsentModalContainer(): ReactNode {
  const { account } = useWalletInfo()
  const { isModalOpen, closeModal, context } = useRwaConsentModalState()
  const tradeConfirmActions = useTradeConfirmActions()

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!context || !account) {
      return null
    }
    return {
      wallet: account,
      ipfsHash: context.consentHash,
    }
  }, [context, account])

  const { confirmConsent } = useRwaConsentStatus(consentKey)

  const onDismiss = useCallback(() => {
    closeModal()
  }, [closeModal])

  const onConfirm = useCallback(() => {
    if (!account || !context || !consentKey) {
      return
    }

    confirmConsent()
    closeModal()
    tradeConfirmActions.onOpen()
  }, [account, context, consentKey, confirmConsent, closeModal, tradeConfirmActions])

  if (!isModalOpen || !context) {
    return null
  }

  return <RwaConsentModal onDismiss={onDismiss} onConfirm={onConfirm} token={context.token} />
}

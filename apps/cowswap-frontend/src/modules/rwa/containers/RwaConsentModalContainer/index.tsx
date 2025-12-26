import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { RwaConsentKey, RwaConsentModal, useRwaConsentModalState, useRwaConsentStatus } from 'modules/rwa'
import { useTradeConfirmActions } from 'modules/trade'

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

    // if this is a token import flow, call the success callback to proceed to import modal
    // if this is a trade flow, open the trade confirmation
    if (context.onImportSuccess) {
      context.onImportSuccess()
    } else {
      tradeConfirmActions.onOpen()
    }
  }, [account, context, consentKey, confirmConsent, closeModal, tradeConfirmActions])

  if (!isModalOpen || !context) {
    return null
  }

  return (
    <RwaConsentModal
      onDismiss={onDismiss}
      onConfirm={onConfirm}
      token={context.token}
      consentHash={context.consentHash}
    />
  )
}

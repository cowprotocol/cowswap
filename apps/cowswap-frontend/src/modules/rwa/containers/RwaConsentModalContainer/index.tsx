import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { RwaConsentKey, RwaConsentModal, useRwaConsentModalState, useRwaConsentStatus } from 'modules/rwa'
import { useDerivedTradeState, useTradeConfirmActions } from 'modules/trade'

import { RwaTokenStatus, useRwaTokenStatus } from '../../hooks/useRwaTokenStatus'

export function RwaConsentModalContainer(): ReactNode {
  const { account } = useWalletInfo()
  const { isModalOpen, closeModal, context } = useRwaConsentModalState()
  const tradeConfirmActions = useTradeConfirmActions()
  const derivedState = useDerivedTradeState()
  const { inputCurrency, outputCurrency } = derivedState || {}
  const { status: currentRwaStatus } = useRwaTokenStatus({ inputCurrency, outputCurrency })

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
    context?.onDismiss?.()
  }, [closeModal, context])

  const onConfirm = useCallback(() => {
    if (!account || !context || !consentKey) {
      return
    }

    // if this is a token import flow, call the success callback to proceed to import modal
    // if this is a trade flow, open the trade confirmation
    if (context.onImportSuccess) {
      confirmConsent()
      closeModal()
      context.onImportSuccess()
    } else {
      if (currentRwaStatus === RwaTokenStatus.ChecksPending || currentRwaStatus === RwaTokenStatus.Restricted) {
        return
      }

      confirmConsent()
      closeModal()

      if (context.onTradeConfirm) {
        context.onTradeConfirm()
      } else {
        tradeConfirmActions.onOpen()
      }
    }
  }, [account, context, consentKey, confirmConsent, closeModal, currentRwaStatus, tradeConfirmActions])

  if (!isModalOpen || !context) {
    return null
  }

  return <RwaConsentModal onDismiss={onDismiss} onConfirm={onConfirm} token={context.token} />
}

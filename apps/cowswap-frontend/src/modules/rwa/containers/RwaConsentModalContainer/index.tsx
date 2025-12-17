import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useRwaConsentModalState } from 'modules/rwa/hooks/useRwaConsentModalState'
import { useRwaConsentStatus } from 'modules/rwa/hooks/useRwaConsentStatus'
import { RwaConsentModal } from 'modules/rwa/pure/RwaConsentModal'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'
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
      tosVersion: context.tosHash,
    }
  }, [context, account])

  const { confirmConsent } = useRwaConsentStatus(consentKey || { wallet: '', tosVersion: '' })

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


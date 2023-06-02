import React from 'react'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeConfirmActions, useWrapNativeFlow } from 'modules/trade'
import { TradeFormButton, TradeFormButtonContext, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'
import { useWalletDetails } from 'modules/wallet'

import { useSetupFallbackHandler } from '../../hooks/useSetupFallbackHandler'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'

export function ActionButtons() {
  const tradeState = useAdvancedOrdersDerivedState()
  const quote = useTradeQuote()
  const setFallbackHandler = useSetupFallbackHandler()
  const tradeConfirmActions = useTradeConfirmActions()
  const toggleWalletModal = useToggleWalletModal()
  const localFormValidation = useTwapFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()

  const primaryActionContext = {
    setFallbackHandler,
    openConfirmModal: tradeConfirmActions.onOpen,
  }

  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext: TradeFormButtonContext = {
    defaultText: 'TWAP order',
    derivedState: tradeState,
    quote,
    isSupportedWallet,
    doTrade() {
      confirmTrade()
    },
    wrapNativeFlow() {
      wrapNativeFlow()
    },
    confirmTrade() {
      confirmTrade()
    },
    connectWallet() {
      toggleWalletModal()
    },
  }

  if (!primaryFormValidation && localFormValidation) {
    return <PrimaryActionButton state={localFormValidation} context={primaryActionContext} />
  }

  return (
    <TradeFormButton
      doTradeText="Place TWAP order"
      confirmText="Review TWAP order"
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      // TODO: bind isExpertMode to settings
      isExpertMode={false}
      isDisabled={false}
    />
  )
}

import { useAtomValue } from 'jotai/utils'
import React from 'react'

import { Trans } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useTradeConfirmActions, useWrapNativeFlow } from 'modules/trade'
import {
  TradeFormButtons,
  useGetTradeFormValidation,
  TradeFormBlankButton,
  TradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'
import { useWalletDetails } from 'modules/wallet'

import { limitOrdersTradeButtonsMap } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  priceImpact: PriceImpact
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, priceImpact } = props

  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeState = useLimitOrdersDerivedState()
  const toggleWalletModal = useToggleWalletModal()
  const quote = useTradeQuote()
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const { isSupportedWallet } = useWalletDetails()
  const tradeConfirmActions = useTradeConfirmActions()
  const wrapNativeFlow = useWrapNativeFlow()

  const handleTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)

  const isExpertMode = settingsState.expertMode

  const tradeFormButtonContext: TradeFormButtonContext = {
    defaultText: 'Limit order',
    derivedState: tradeState,
    doTrade: handleTrade,
    quote,
    isSupportedWallet,
    wrapNativeFlow,
    confirmTrade() {
      tradeConfirmActions.onOpen()
    },
    connectWallet() {
      toggleWalletModal()
    },
  }

  // Display local form validation errors only when there are no primary errors
  if (!primaryFormValidation && localFormValidation) {
    const buttonFactory = limitOrdersTradeButtonsMap[localFormValidation]

    return typeof buttonFactory === 'function' ? (
      buttonFactory()
    ) : (
      <TradeFormBlankButton id={buttonFactory.id} disabled={true}>
        <Trans>{buttonFactory.text}</Trans>
      </TradeFormBlankButton>
    )
  }

  return (
    <TradeFormButtons
      doTradeText="Place limit order"
      confirmText="Review limit order"
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isExpertMode={isExpertMode}
      isDisabled={!warningsAccepted}
    />
  )
}

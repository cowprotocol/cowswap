import React from 'react'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, TradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface ActionButtonsProps {
  localFormValidation: TwapFormState | null
  primaryFormValidation: TradeFormValidation | null
  walletIsNotConnected: boolean
}

export function ActionButtons({
  localFormValidation,
  primaryFormValidation,
  walletIsNotConnected,
}: ActionButtonsProps) {
  const tradeConfirmActions = useTradeConfirmActions()

  const confirmTrade = tradeConfirmActions.onOpen

  const primaryActionContext = {
    confirmTrade,
  }

  const tradeFormButtonContext = useTradeFormButtonContext('TWAP order', { doTrade: confirmTrade, confirmTrade })

  if (!tradeFormButtonContext) return null

  // Show local form validation errors only when wallet is connected
  if (localFormValidation && !walletIsNotConnected) {
    return <PrimaryActionButton state={localFormValidation} context={primaryActionContext} />
  }

  return (
    <TradeFormButtons
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

import React from 'react'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { useSetupFallbackHandler } from '../../hooks/useSetupFallbackHandler'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface ActionButtonsProps {
  formValidation: TwapFormState | null
}

export function ActionButtons({ formValidation: localFormValidation }: ActionButtonsProps) {
  const setFallbackHandler = useSetupFallbackHandler()
  const tradeConfirmActions = useTradeConfirmActions()
  const primaryFormValidation = useGetTradeFormValidation()

  const primaryActionContext = {
    setFallbackHandler,
  }

  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext('TWAP order', { doTrade: confirmTrade, confirmTrade })
  // Show local form validation errors only when wallet is connected
  const walletIsNotConnected = primaryFormValidation === TradeFormValidation.WalletNotConnected

  if (!tradeFormButtonContext) return null

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

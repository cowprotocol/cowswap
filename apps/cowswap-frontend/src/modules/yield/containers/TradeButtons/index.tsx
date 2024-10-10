import React from 'react'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, useGetTradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

const CONFIRM_TEXT = 'Swap'

interface TradeButtonsProps {
  isTradeContextReady: boolean
}

export function TradeButtons({ isTradeContextReady }: TradeButtonsProps) {
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()

  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext(CONFIRM_TEXT, confirmTrade)

  const isDisabled = !isTradeContextReady || !feeWarningAccepted

  if (!tradeFormButtonContext) return null

  return (
    <TradeFormButtons
      confirmText={CONFIRM_TEXT}
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={isDisabled}
    />
  )
}

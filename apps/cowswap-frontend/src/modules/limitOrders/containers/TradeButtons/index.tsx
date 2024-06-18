import React from 'react'

import { Trans } from '@lingui/macro'

import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useTradeConfirmActions } from 'modules/trade'
import {
  TradeFormBlankButton,
  TradeFormButtons,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'

import { limitOrdersTradeButtonsMap } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

const CONFIRM_TEXT = 'Review limit order'

export function TradeButtons() {
  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const tradeConfirmActions = useTradeConfirmActions()

  const confirmTrade = tradeConfirmActions.onOpen

  const defaultText = CONFIRM_TEXT

  const tradeFormButtonContext = useTradeFormButtonContext(defaultText, confirmTrade)

  if (!tradeFormButtonContext) return null

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
      confirmText={CONFIRM_TEXT}
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={!warningsAccepted}
    />
  )
}

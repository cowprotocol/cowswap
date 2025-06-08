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
import { TradeFormValidation } from 'modules/tradeFormValidation/types'

import { limitOrdersTradeButtonsMap } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

const CONFIRM_TEXT = 'Review limit order'

const PRIMARY_VALIDATION_OVERRIDEN_BY_LOCAL_VALIDATION: TradeFormValidation[] = [
  TradeFormValidation.ApproveAndSwap,
  TradeFormValidation.ApproveRequired,
]

interface TradeButtonsProps {
  isTradeContextReady: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeButtons({ isTradeContextReady }: TradeButtonsProps) {
  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const tradeConfirmActions = useTradeConfirmActions()

  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext(CONFIRM_TEXT, confirmTrade)

  const isDisabled = !warningsAccepted || !isTradeContextReady

  if (!tradeFormButtonContext) return null

  // Display local form validation errors only when there are no primary errors
  if (
    (!primaryFormValidation ||
      PRIMARY_VALIDATION_OVERRIDEN_BY_LOCAL_VALIDATION.indexOf(primaryFormValidation) !== -1) &&
    localFormValidation
  ) {
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
      isDisabled={isDisabled}
    />
  )
}

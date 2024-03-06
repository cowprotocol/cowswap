import React from 'react'

import { Trans } from '@lingui/macro'

import { tradeButtonsMap } from './tradeButtonsMap'

import { TradeFormButtonContext, TradeFormValidation } from '../../types'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

export interface TradeFormButtonsProps {
  validation: TradeFormValidation | null
  context: TradeFormButtonContext
  confirmText: string
  isDisabled?: boolean
}

export function TradeFormButtons(props: TradeFormButtonsProps) {
  const { validation, context, isDisabled, confirmText } = props

  // When there are no validation errors
  if (validation === null) {
    return (
      <TradeFormBlankButton id="do-trade-button" disabled={isDisabled} onClick={() => context.confirmTrade()}>
        {confirmText}
      </TradeFormBlankButton>
    )
  }

  const buttonFactory = tradeButtonsMap[validation]

  if (typeof buttonFactory === 'function') {
    return buttonFactory(context, isDisabled)
  }

  return (
    <TradeFormBlankButton id={buttonFactory.id} disabled={true}>
      <Trans>{buttonFactory.text}</Trans>
    </TradeFormBlankButton>
  )
}

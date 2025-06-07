import React from 'react'

import { Trans } from '@lingui/macro'

import { tradeButtonsMap } from './tradeButtonsMap'

import { TradeFormButtonContext, TradeFormValidation } from '../../types'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

export interface TradeFormButtonsProps {
  validation: TradeFormValidation | null
  context: TradeFormButtonContext
  confirmText: string
  className?: string
  isDisabled?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeFormButtons(props: TradeFormButtonsProps) {
  const { validation, context, isDisabled, confirmText, className } = props

  // When there are no validation errors
  if (validation === null) {
    return (
      <TradeFormBlankButton
        id="do-trade-button"
        className={className}
        disabled={isDisabled}
        onClick={() => context.confirmTrade()}
      >
        {confirmText}
      </TradeFormBlankButton>
    )
  }

  const buttonFactory = tradeButtonsMap[validation]

  if (typeof buttonFactory === 'function') {
    return buttonFactory(context, isDisabled)
  }

  return (
    <TradeFormBlankButton id={buttonFactory.id} className={className} disabled={true}>
      <Trans>{buttonFactory.text}</Trans>
    </TradeFormBlankButton>
  )
}

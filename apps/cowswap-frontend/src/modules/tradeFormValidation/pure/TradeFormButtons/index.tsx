import React, { ReactNode } from 'react'

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

export function TradeFormButtons(props: TradeFormButtonsProps): ReactNode {
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
      <>{buttonFactory.text}</>
    </TradeFormBlankButton>
  )
}

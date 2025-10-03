import React, { ReactNode } from 'react'

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
  'data-click-event'?: string
}

export function TradeFormButtons(props: TradeFormButtonsProps): ReactNode {
  const { validation, context, isDisabled, confirmText, className, 'data-click-event': dataClickEvent } = props

  // When there are no validation errors
  if (validation === null) {
    return (
      <TradeFormBlankButton
        id="do-trade-button"
        className={className}
        disabled={isDisabled}
        onClick={() => context.confirmTrade()}
        data-click-event={dataClickEvent}
      >
        {confirmText}
      </TradeFormBlankButton>
    )
  }

  const buttonFactory = tradeButtonsMap[validation]

  if (typeof buttonFactory === 'function') {
    return buttonFactory({ ...context, analyticsEvent: dataClickEvent }, isDisabled)
  }

  return (
    <TradeFormBlankButton id={buttonFactory.id} className={className} disabled={true}>
      <Trans>{buttonFactory.text}</Trans>
    </TradeFormBlankButton>
  )
}

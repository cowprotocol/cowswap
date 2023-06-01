import React from 'react'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

import { TradeApproveButton } from 'common/containers/TradeApprove'
import { TokenSymbol } from 'common/pure/TokenSymbol'

import { TradeFormValidation } from '../../types'

export interface TradeFormButtonContext {
  defaultText: string
  derivedState: TradeDerivedState
  doTrade(): void
  confirmAndTrade(): void
}

interface ButtonErrorConfig {
  text: string
  id?: string
}

interface ButtonCallback {
  (context: TradeFormButtonContext): JSX.Element | null
}

const ActionButton = styled.div<{ disabled?: boolean }>`
  background: red;
`

const buttonsMap: Record<TradeFormValidation, ButtonErrorConfig | ButtonCallback> = {
  [TradeFormValidation.Approve]: (context) => {
    const amountToApprove = context.derivedState.slippageAdjustedSellAmount

    if (!amountToApprove) return null

    return (
      <TradeApproveButton amountToApprove={amountToApprove}>
        <ActionButton disabled={true}>
          <Trans>{context.defaultText}</Trans>
        </ActionButton>
      </TradeApproveButton>
    )
  },
  [TradeFormValidation.ApproveAndSwap]: (context) => {
    const tokenToApprove = context.derivedState.slippageAdjustedSellAmount?.currency.wrapped

    return (
      <ActionButton onClick={context.confirmAndTrade}>
        <Trans>
          Approve&nbsp;{<TokenSymbol token={tokenToApprove} length={6} />}&nbsp;and {context.defaultText}
        </Trans>
      </ActionButton>
    )
  },
  [TradeFormValidation.ExpertApproveAndSwap]: (context) => {
    const tokenToApprove = context.derivedState.slippageAdjustedSellAmount?.currency.wrapped

    return (
      <ActionButton onClick={context.doTrade}>
        <Trans>
          Confirm (Approve&nbsp;{<TokenSymbol token={tokenToApprove} length={6} />}&nbsp;and {context.defaultText})
        </Trans>
      </ActionButton>
    )
  },
  [TradeFormValidation.Default]: (context) => {
    return (
      <ActionButton onClick={context.doTrade}>
        <Trans>{context.defaultText}</Trans>
      </ActionButton>
    )
  },
}

export function TradeFormButton(validation: TradeFormValidation, context: TradeFormButtonContext) {
  const buttonFactory = buttonsMap[validation]

  if (typeof buttonFactory === 'function') {
    return buttonFactory(context)
  }

  return (
    <ActionButton id={buttonFactory.id} disabled={true}>
      <Trans>{buttonFactory.text}</Trans>
    </ActionButton>
  )
}

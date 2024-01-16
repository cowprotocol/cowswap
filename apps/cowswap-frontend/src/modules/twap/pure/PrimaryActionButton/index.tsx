import React from 'react'

import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { TwapFormState } from './getTwapFormState'

export interface PrimaryActionButtonContext {
  confirmTrade(): void
}

const buttonsMap: Record<TwapFormState, (_context: PrimaryActionButtonContext) => JSX.Element> = {
  [TwapFormState.LOADING_SAFE_INFO]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Loading...
    </ButtonPrimary>
  ),
  [TwapFormState.NOT_SAFE]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Unsupported wallet
    </ButtonPrimary>
  ),
  [TwapFormState.SELL_AMOUNT_TOO_SMALL]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Sell amount too small
    </ButtonPrimary>
  ),
  [TwapFormState.PART_TIME_INTERVAL_TOO_SHORT]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Interval time too short
    </ButtonPrimary>
  ),
  [TwapFormState.PART_TIME_INTERVAL_TOO_LONG]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Interval time too long
    </ButtonPrimary>
  ),
}

export interface PrimaryActionButtonProps {
  state: TwapFormState
  context: PrimaryActionButtonContext
}

export function PrimaryActionButton(props: PrimaryActionButtonProps) {
  return buttonsMap[props.state](props.context)
}

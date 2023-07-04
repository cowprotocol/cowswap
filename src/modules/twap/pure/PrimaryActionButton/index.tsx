import React from 'react'

import { ButtonPrimary } from 'legacy/components/Button'
import { ButtonSize } from 'legacy/theme/enum'

import { TwapFormState } from './getTwapFormState'

export interface PrimaryActionButtonContext {
  confirmTrade(): void
}

const buttonsMap: Record<TwapFormState, (context: PrimaryActionButtonContext) => JSX.Element> = {
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
  [TwapFormState.NEED_FALLBACK_HANDLER]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Unsupported Safe
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
}

export interface PrimaryActionButtonProps {
  state: TwapFormState
  context: PrimaryActionButtonContext
}

export function PrimaryActionButton(props: PrimaryActionButtonProps) {
  return buttonsMap[props.state](props.context)
}

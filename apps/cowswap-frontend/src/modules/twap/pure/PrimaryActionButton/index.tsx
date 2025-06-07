import { ReactElement } from 'react'

import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { TwapFormState } from './getTwapFormState'

export interface PrimaryActionButtonContext {
  confirmTrade(): void
}

const buttonsMap: Record<TwapFormState, (_context: PrimaryActionButtonContext) => ReactElement> = {
  [TwapFormState.LOADING_SAFE_INFO]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Loading...
    </ButtonPrimary>
  ),
  [TwapFormState.TX_BUNDLING_NOT_SUPPORTED]: () => (
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PrimaryActionButton(props: PrimaryActionButtonProps) {
  return buttonsMap[props.state](props.context)
}

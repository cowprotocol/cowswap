import React from 'react'

import { ButtonPrimary } from 'legacy/components/Button'
import { ButtonSize } from 'legacy/theme/enum'

import { TwapFormState } from './getTwapFormState'

export interface PrimaryActionButtonContext {
  openConfirmModal(): void
  setFallbackHandler(): void
}

// TODO: extend with common trade widget states
// TODO: set correct buttons text
const buttonsMap: Record<TwapFormState, (context: PrimaryActionButtonContext) => JSX.Element> = {
  [TwapFormState.LOADING]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Loading...
    </ButtonPrimary>
  ),
  [TwapFormState.NOT_SAFE]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Please, connect to Safe
    </ButtonPrimary>
  ),
  [TwapFormState.ORDER_NOT_SPECIFIED]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      Please, specify an order
    </ButtonPrimary>
  ),
  [TwapFormState.NEED_FALLBACK_HANDLER]: ({ setFallbackHandler }: PrimaryActionButtonContext) => (
    <ButtonPrimary onClick={setFallbackHandler} buttonSize={ButtonSize.BIG}>
      Set fallback handler
    </ButtonPrimary>
  ),
  [TwapFormState.CAN_CREATE_ORDER]: ({ openConfirmModal }: PrimaryActionButtonContext) => (
    <ButtonPrimary onClick={openConfirmModal} buttonSize={ButtonSize.BIG}>
      Create TWAP order
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

import React from 'react'

import { ButtonPrimary } from 'legacy/components/Button'
import { ButtonSize } from 'legacy/theme/enum'

import { TwapFormState } from './getTwapFormState'

export interface PrimaryActionButtonContext {
  setFallbackHandler(): void
}

// TODO: set correct buttons text
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
  [TwapFormState.NEED_FALLBACK_HANDLER]: ({ setFallbackHandler }: PrimaryActionButtonContext) => (
    <ButtonPrimary onClick={setFallbackHandler} buttonSize={ButtonSize.BIG}>
      Set fallback handler
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

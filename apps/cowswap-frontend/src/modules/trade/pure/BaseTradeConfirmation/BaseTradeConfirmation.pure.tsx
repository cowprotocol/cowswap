import { ReactNode } from 'react'

import * as styledEl from './BaseTradeConfirmation.styled'

import {
  ConfirmationSuccessHeading,
  ConfirmationSuccessHeadingProps,
} from '../ConfirmationSuccessHeading/ConfirmationSuccessHeading.pure'
import { TradeTokenPair, TradeTokenPairProps } from '../TradeTokenPair/TradeTokenPair.pure'

export interface BaseTradeConfirmationProps {
  heading?: ConfirmationSuccessHeadingProps
  tokenPair?: TradeTokenPairProps
  children?: ReactNode
  className?: string
}

export function BaseTradeConfirmation({
  heading,
  tokenPair,
  children,
  className,
}: BaseTradeConfirmationProps): ReactNode {
  const hasBody = Boolean(tokenPair || children)

  return (
    <styledEl.Wrapper className={className} data-testid="base-trade-confirmation">
      {heading ? <ConfirmationSuccessHeading {...heading} /> : null}
      {hasBody ? (
        <styledEl.Content>
          {tokenPair ? <TradeTokenPair {...tokenPair} /> : null}
          {children}
        </styledEl.Content>
      ) : null}
    </styledEl.Wrapper>
  )
}

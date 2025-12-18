import { ReactNode, useEffect, useRef, useState } from 'react'

import { useSigningStep } from 'entities/trade'

import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { TradeConfirmationProps, TradeConfirmationView } from '../../pure/TradeConfirmation'

function useScrollToTopOnMount(): void {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}

function useStableTradeConfirmationProps(
  initialProps: TradeConfirmationProps,
  hasPendingTrade: boolean,
): TradeConfirmationProps {
  const propsRef = useRef(initialProps)
  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)

  useEffect(() => {
    propsRef.current = initialProps
  }, [initialProps])

  useEffect(() => {
    if (hasPendingTrade) {
      setFrozenProps((current) => current ?? propsRef.current)
    } else {
      setFrozenProps(null)
    }
  }, [hasPendingTrade])

  return frozenProps || initialProps
}

export function TradeConfirmation(initialProps: TradeConfirmationProps): ReactNode {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()
  const hasPendingTrade = Boolean(pendingTrade)
  const signingStep = useSigningStep()

  const stableProps = useStableTradeConfirmationProps(initialProps, hasPendingTrade)

  useScrollToTopOnMount()

  return (
    <TradeConfirmationView
      {...stableProps}
      hasPendingTrade={hasPendingTrade}
      signingStep={signingStep}
      forcePriceConfirmation={forcePriceConfirmation}
    />
  )
}

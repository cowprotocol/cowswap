import { ReactNode, useMemo } from 'react'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { OrderSteps } from 'modules/trade'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { buildEoaTwapConfirmationPendingSteps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

export function EoaTwapSigningPendingContent(): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const token = inputCurrencyAmount?.currency
  const symbol = token?.symbol
  const steps = useMemo(() => {
    return signingStep ? buildEoaTwapConfirmationPendingSteps({ signingStep, symbol, token }) : undefined
  }, [signingStep, symbol, token])

  if (!steps) {
    return null
  }

  return <OrderSteps steps={steps} />
}

import { ReactNode, useMemo } from 'react'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { OrderSteps } from 'modules/trade'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { buildEoaTwapConfirmationPendingSteps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

export function EoaTwapSigningPendingContent(): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const symbol = inputCurrencyAmount?.currency.symbol
  const steps = useMemo(() => {
    return signingStep ? buildEoaTwapConfirmationPendingSteps({ signingStep, symbol }) : undefined
  }, [signingStep, symbol])

  return steps ? <OrderSteps steps={steps} /> : null
}

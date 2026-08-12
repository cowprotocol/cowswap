import { ReactNode } from 'react'

import { OrderStep, OrderStepItem } from './item/OrderStepItem.pure'
import * as styledEl from './OrderSteps.styled'

export interface OrderStepsProps {
  /**
   * Arbitrary multi-step progress.
   */
  steps: OrderStep[]
}

export function OrderSteps({ steps }: OrderStepsProps): ReactNode {
  return (
    <styledEl.StepsList>
      {steps.map((step) => (
        <OrderStepItem key={step.id} step={step} />
      ))}
    </styledEl.StepsList>
  )
}

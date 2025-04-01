import { OrderProgressBarStepName } from 'common/hooks/orderProgressBarV2/types'

import * as styledEl from './styled'
import { OrderProgressBarV2Props } from './types'

interface DebugPanelProps {
  STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, React.ComponentType<OrderProgressBarV2Props>>
  stepName: OrderProgressBarStepName
  setDebugStep: (stepName: OrderProgressBarStepName) => void
}

export function DebugPanel({ STEP_NAME_TO_STEP_COMPONENT, stepName, setDebugStep }: DebugPanelProps) {
  return (
    <styledEl.DebugPanel>
      <select value={stepName} onChange={(e) => setDebugStep(e.target.value as OrderProgressBarStepName)}>
        {Object.keys(STEP_NAME_TO_STEP_COMPONENT).map((step) => (
          <option key={step} value={step}>
            {step}
          </option>
        ))}
      </select>
    </styledEl.DebugPanel>
  )
}

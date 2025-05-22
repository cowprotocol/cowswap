import * as styledEl from './styled'

import { OrderProgressBarProps, OrderProgressBarStepName } from '../types'

interface DebugPanelProps {
  stepNameToStepComponent: Record<OrderProgressBarStepName, React.ComponentType<OrderProgressBarProps>>
  stepName: OrderProgressBarStepName
  setDebugStep: (stepName: OrderProgressBarStepName) => void
}

export function DebugPanel({ stepNameToStepComponent, stepName, setDebugStep }: DebugPanelProps) {
  return (
    <styledEl.DebugPanel>
      <label htmlFor="debug-step-select">Debug Step:</label>
      <select
        id="debug-step-select"
        value={stepName}
        aria-label="Select debug step"
        onChange={(e) => setDebugStep(e.target.value as OrderProgressBarStepName)}
      >
        {Object.keys(stepNameToStepComponent).map((step) => (
          <option key={step} value={step}>
            {step}
          </option>
        ))}
      </select>
    </styledEl.DebugPanel>
  )
}

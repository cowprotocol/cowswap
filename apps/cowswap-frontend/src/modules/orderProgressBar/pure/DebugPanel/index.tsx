import styled from 'styled-components/macro'

import { OrderProgressBarProps, OrderProgressBarStepName } from '../../types'

const Wrapper = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
`

interface DebugPanelProps {
  stepNameToStepComponent: Record<OrderProgressBarStepName, React.ComponentType<OrderProgressBarProps>>
  stepName: OrderProgressBarStepName
  setDebugStep: (stepName: OrderProgressBarStepName) => void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DebugPanel({ stepNameToStepComponent, stepName, setDebugStep }: DebugPanelProps) {
  return (
    <Wrapper>
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
    </Wrapper>
  )
}

import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { OrderProgressBarStepName } from '../../types'

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
  stepName: OrderProgressBarStepName
  setDebugStep: (stepName: OrderProgressBarStepName) => void
}

export function DebugPanel({ stepName, setDebugStep }: DebugPanelProps): ReactNode {
  return (
    <Wrapper>
      <label htmlFor="debug-step-select">{t`Debug Step:`}</label>
      <select
        id="debug-step-select"
        value={stepName}
        aria-label={t`Select debug step`}
        onChange={(e) => setDebugStep(e.target.value as OrderProgressBarStepName)}
      >
        {Object.values(OrderProgressBarStepName).map((step) => (
          <option key={step} value={step}>
            {step}
          </option>
        ))}
      </select>
    </Wrapper>
  )
}

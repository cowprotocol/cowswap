import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'
import { createPortal } from 'react-dom'
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
  z-index: 10000;
`

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
`

const Select = styled.select`
  appearance: auto;
  margin: 0;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  font: inherit;
  cursor: pointer;

  option {
    color: #111;
    background: #fff;
  }
`

interface DebugPanelProps {
  stepName: OrderProgressBarStepName
  setDebugStep: (stepName: OrderProgressBarStepName) => void
}

export function DebugPanel({ stepName, setDebugStep }: DebugPanelProps): ReactNode {
  return createPortal(
    <Wrapper>
      <Label htmlFor="debug-step-select">{t`Debug Step:`}</Label>
      <Select
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
      </Select>
    </Wrapper>,
    document.body,
  )
}

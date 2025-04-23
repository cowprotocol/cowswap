import React from 'react'

import { UI } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { StepsWrapper } from '../container/StepsWrapper'

interface CancellingStepProps {
  children: React.ReactNode
}

export function CancellingStep({ children }: CancellingStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        steps={[{ title: 'Cancelling' }]}
        currentStep={0}
        extraContent={<styledEl.Description>Your order is being cancelled.</styledEl.Description>}
        customColor={`var(${UI.COLOR_DANGER_TEXT})`}
        isCancelling={true}
      />
    </styledEl.ProgressContainer>
  )
}

import React from 'react'

import { UI } from '@cowprotocol/ui'

import StepsWrapper from '../container/StepsWrapper'
import * as styledEl from '../styled'

interface CancellingStepProps {
    children: React.ReactNode
}

function CancellingStep({ children }: CancellingStepProps) {
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

export default CancellingStep

import { ReactNode } from 'react'

import * as styledEl from './styled'

import { STEPS } from '../../constants'
import { Description } from '../../sharedStyled'
import { StepsWrapper } from '../StepsWrapper'

interface ExecutingStepProps {
  children: ReactNode
  isBridgingTrade: boolean
}

export function ExecutingStep({ children, isBridgingTrade }: ExecutingStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        isBridgingTrade={isBridgingTrade}
        steps={STEPS}
        currentStep={2}
        customStepTitles={{ 2: 'Best price found!' }}
        extraContent={<Description>The winner of the competition is now executing your order on-chain.</Description>}
      />
    </styledEl.ProgressContainer>
  )
}

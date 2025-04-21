import * as styledEl from './styled'

import { STEPS } from '../constants'
import { StepsWrapper } from '../container/StepsWrapper'

interface ExecutingStepProps {
  children: React.ReactNode
}

export function ExecutingStep({ children }: ExecutingStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        steps={STEPS}
        currentStep={2}
        customStepTitles={{ 2: 'Best price found!' }}
        extraContent={
          <styledEl.Description>
            The winner of the competition is now executing your order on-chain.
          </styledEl.Description>
        }
      />
    </styledEl.ProgressContainer>
  )
}

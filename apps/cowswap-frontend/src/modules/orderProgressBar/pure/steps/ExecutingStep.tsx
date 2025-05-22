import * as styledEl from './styled'

import { STEPS } from '../../constants'
import { Description } from '../../sharedStyled'
import { StepsWrapper } from '../StepsWrapper'

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
        extraContent={<Description>The winner of the competition is now executing your order on-chain.</Description>}
      />
    </styledEl.ProgressContainer>
  )
}

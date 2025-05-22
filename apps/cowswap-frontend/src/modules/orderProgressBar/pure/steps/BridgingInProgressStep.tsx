import { ReactNode } from 'react'

import * as styledEl from './styled'

import { Description } from '../../sharedStyled'

interface BridgingInProgressStepProps {
  children: ReactNode
}

export function BridgingInProgressStep({ children }: BridgingInProgressStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <styledEl.ConclusionContent>TODO CONTENT</styledEl.ConclusionContent>

      <styledEl.CardWrapper>TODO DESCRIPTION</styledEl.CardWrapper>

      <Description center margin="10px 0">
        TODO DESCRIPTION
      </Description>
    </styledEl.ProgressContainer>
  )
}

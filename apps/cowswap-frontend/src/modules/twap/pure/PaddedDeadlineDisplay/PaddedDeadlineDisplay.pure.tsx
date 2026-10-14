import { ReactNode } from 'react'

import * as styledEl from './PaddedDeadlineDisplay.styled'

import { getPaddedDeadlineParts } from '../../utils/getPaddedDeadlineParts.utils'

export interface PaddedDeadlineDisplayProps {
  seconds: number
}

export function PaddedDeadlineDisplay({ seconds }: PaddedDeadlineDisplayProps): ReactNode {
  const parts = getPaddedDeadlineParts(seconds)

  return (
    <styledEl.Wrapper>
      {parts.map((part) => (
        <styledEl.Part key={part.unit} $significant={part.isSignificant}>
          {part.label}
        </styledEl.Part>
      ))}
    </styledEl.Wrapper>
  )
}

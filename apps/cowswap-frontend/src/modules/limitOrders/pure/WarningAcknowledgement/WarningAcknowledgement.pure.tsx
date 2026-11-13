import { ReactNode } from 'react'

import * as styledEl from './WarningAcknowledgement.styled'

export interface WarningAcknowledgementProps {
  isAccepted: boolean
  onAcknowledgeChange(checked: boolean): void
  checkboxTestId?: string
  children: ReactNode
}

export function WarningAcknowledgement({
  isAccepted,
  onAcknowledgeChange,
  checkboxTestId,
  children,
}: WarningAcknowledgementProps): ReactNode {
  return (
    <styledEl.AcknowledgeBox>
      <label>
        <input
          type="checkbox"
          checked={isAccepted}
          onChange={(event) => onAcknowledgeChange(event.target.checked)}
          data-testid={checkboxTestId}
        />
        <span>{children}</span>
      </label>
    </styledEl.AcknowledgeBox>
  )
}

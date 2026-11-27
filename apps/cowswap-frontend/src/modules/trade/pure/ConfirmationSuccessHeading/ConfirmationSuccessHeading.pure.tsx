import { ReactNode } from 'react'

import { Check } from 'react-feather'

import * as styledEl from './ConfirmationSuccessHeading.styled'

export interface ConfirmationSuccessHeadingProps {
  title: ReactNode
  subtitle?: ReactNode
  className?: string
}

export function ConfirmationSuccessHeading({ title, subtitle, className }: ConfirmationSuccessHeadingProps): ReactNode {
  return (
    <styledEl.Wrapper className={className} data-testid="confirmation-success-heading">
      <styledEl.Content>
        <styledEl.IconCircle aria-hidden>
          <styledEl.CheckIcon>
            <Check strokeWidth={3} />
          </styledEl.CheckIcon>
        </styledEl.IconCircle>
        <styledEl.Title>{title}</styledEl.Title>
        {subtitle ? <styledEl.Subtitle>{subtitle}</styledEl.Subtitle> : null}
      </styledEl.Content>
    </styledEl.Wrapper>
  )
}

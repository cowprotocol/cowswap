import { ReactNode } from 'react'

import { ModalFooter } from './ModalFooter.pure'
import * as styledEl from './ModalFooter.styled'

export interface ModalFooterButtonConfig {
  disabled?: boolean
  label: ReactNode
  onClick(): void
  type?: 'button' | 'submit'
}

export interface ModalFooterWithTwoButtonsProps {
  inline?: boolean
  primaryButton: ModalFooterButtonConfig
  secondaryButton: ModalFooterButtonConfig
}

export function ModalFooterWithTwoButtons({
  inline,
  primaryButton,
  secondaryButton,
}: ModalFooterWithTwoButtonsProps): ReactNode {
  return (
    <ModalFooter inline={inline}>
      <styledEl.TwoButtonGrid>
        <styledEl.SecondaryButton
          disabled={secondaryButton.disabled}
          type={secondaryButton.type ?? 'button'}
          onClick={secondaryButton.onClick}
        >
          {secondaryButton.label}
        </styledEl.SecondaryButton>
        <styledEl.PrimaryButton
          disabled={primaryButton.disabled}
          type={primaryButton.type ?? 'button'}
          onClick={primaryButton.onClick}
        >
          {primaryButton.label}
        </styledEl.PrimaryButton>
      </styledEl.TwoButtonGrid>
    </ModalFooter>
  )
}

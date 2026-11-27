import { ReactNode } from 'react'

import { ModalFooter } from './ModalFooter.pure'
import * as styledEl from './ModalFooter.styled'

export interface ModalFooterButtonConfig {
  disabled?: boolean
  label: ReactNode
  onClick(): void
  type?: 'button' | 'submit'
  variant?: ModalFooterButtonVariant
}

export type ModalFooterButtonVariant = 'default' | 'error'

export type ModalFooterWithTwoButtonsProps = {
  inline?: boolean
} & (
  | { primaryButton: ModalFooterButtonConfig; secondaryButton?: ModalFooterButtonConfig }
  | { primaryButton?: ModalFooterButtonConfig; secondaryButton: ModalFooterButtonConfig }
)

export function ModalFooterWithTwoButtons({
  inline,
  primaryButton,
  secondaryButton,
}: ModalFooterWithTwoButtonsProps): ReactNode {
  const secondary = secondaryButton ? (
    <styledEl.SecondaryButton
      disabled={secondaryButton.disabled}
      type={secondaryButton.type ?? 'button'}
      onClick={secondaryButton.onClick}
    >
      {secondaryButton.label}
    </styledEl.SecondaryButton>
  ) : null

  const PrimaryButtonComponent =
    primaryButton?.variant === 'error' ? styledEl.PrimaryErrorButton : styledEl.PrimaryButton

  const primary = primaryButton ? (
    <PrimaryButtonComponent
      disabled={primaryButton.disabled}
      type={primaryButton.type ?? 'button'}
      onClick={primaryButton.onClick}
    >
      {primaryButton.label}
    </PrimaryButtonComponent>
  ) : null

  return (
    <ModalFooter inline={inline}>
      {secondary && primary ? (
        <styledEl.TwoButtonGrid>
          {secondary}
          {primary}
        </styledEl.TwoButtonGrid>
      ) : (
        (secondary ?? primary)
      )}
    </ModalFooter>
  )
}

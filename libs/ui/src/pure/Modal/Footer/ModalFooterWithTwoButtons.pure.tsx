import { ReactNode } from 'react'

import { ModalFooter } from './ModalFooter.pure'
import * as styledEl from './ModalFooter.styled'

export interface ModalFooterButtonConfig {
  disabled?: boolean
  label: ReactNode
  onClick(): void
  type?: 'button' | 'submit'
}

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
  const secondary = secondaryButton ? <FooterButton Button={styledEl.SecondaryButton} config={secondaryButton} /> : null
  const primary = primaryButton ? <FooterButton Button={styledEl.PrimaryButton} config={primaryButton} /> : null

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

function FooterButton({
  Button,
  config,
}: {
  Button: typeof styledEl.PrimaryButton | typeof styledEl.SecondaryButton
  config: ModalFooterButtonConfig
}): ReactNode {
  return (
    <Button disabled={config.disabled} type={config.type ?? 'button'} onClick={config.onClick}>
      {config.label}
    </Button>
  )
}

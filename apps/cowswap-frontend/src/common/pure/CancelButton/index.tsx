import { PropsWithChildren } from 'react'

import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { LinkStyledButton } from 'theme'

export type CancelButtonProps = {
  onClick: Command
  className?: string
} & PropsWithChildren

export function CancelButton({ onClick, children, className }: CancelButtonProps) {
  return (
    <LinkStyledButton onClick={onClick} className={className} color={`var(${UI.COLOR_DANGER})`}>
      {children || 'Cancel order'}
    </LinkStyledButton>
  )
}

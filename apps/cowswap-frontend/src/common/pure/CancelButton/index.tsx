import { PropsWithChildren } from 'react'

import { Command } from '@cowprotocol/types'

import { LinkStyledButton } from 'theme'

export type CancelButtonProps = {
  onClick: Command
  className?: string
} & PropsWithChildren

export function CancelButton({ onClick, children, className }: CancelButtonProps) {
  return (
    <LinkStyledButton onClick={onClick} className={className}>
      {children || 'Cancel order'}
    </LinkStyledButton>
  )
}

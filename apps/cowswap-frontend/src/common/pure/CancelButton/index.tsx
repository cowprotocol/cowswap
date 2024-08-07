import { PropsWithChildren } from 'react'

import { Command } from '@cowprotocol/types'

import { LinkStyledButton } from 'theme'

export type CancelButtonProps = {
  onClick: Command
} & PropsWithChildren

export function CancelButton({ onClick, children }: CancelButtonProps) {
  return <LinkStyledButton onClick={onClick}>{children || 'Cancel order'}</LinkStyledButton>
}

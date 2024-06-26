import { Command } from '@cowprotocol/types'

import { LinkStyledButton } from 'theme'

export type CancelButtonProps = {
  onClick: Command
}

export function CancelButton({ onClick }: CancelButtonProps) {
  return <LinkStyledButton onClick={onClick}>Cancel order</LinkStyledButton>
}

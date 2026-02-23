import { PropsWithChildren, ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { LinkStyledButton } from 'theme'

export type CancelButtonProps = {
  onClick: Command
  className?: string
} & PropsWithChildren

export function CancelButton({ onClick, children, className }: CancelButtonProps): ReactNode {
  return (
    <LinkStyledButton onClick={onClick} className={className} color={`var(${UI.COLOR_DANGER})`}>
      {children || <Trans>Cancel order</Trans>}
    </LinkStyledButton>
  )
}

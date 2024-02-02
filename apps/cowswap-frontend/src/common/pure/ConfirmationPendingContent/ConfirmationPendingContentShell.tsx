import React, { ReactNode } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { Wrapper } from './styled'
import { UpperSection } from './styled'
import { WalletIcon } from './styled'
import { LowerSection } from './styled'

import { useWalletStatusIcon } from '../../hooks/useWalletStatusIcon'

interface ConfirmationPendingContentShellProps {
  onDismiss: () => void
  title: ReactNode
  description: ReactNode
  children: ReactNode
}

export function ConfirmationPendingContentShell({
  title,
  onDismiss,
  description,
  children: body,
}: ConfirmationPendingContentShellProps) {
  const statusIcon = useWalletStatusIcon()

  return (
    <Wrapper>
      <UpperSection>
        <BackButton onClick={onDismiss} />
        <WalletIcon>{statusIcon}</WalletIcon>
        <span>{title}</span>
      </UpperSection>
      <LowerSection>
        <h3>
          <span>{description}</span>
        </h3>

        {body}
      </LowerSection>
    </Wrapper>
  )
}

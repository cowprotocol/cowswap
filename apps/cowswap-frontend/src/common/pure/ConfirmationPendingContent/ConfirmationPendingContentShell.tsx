import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { Wrapper, CloseIcon, UpperSection, WalletIcon, LowerSection, BackButtonStyled } from './styled'

import { useWalletStatusIcon } from '../../hooks/useWalletStatusIcon'

interface ConfirmationPendingContentShellProps {
  onDismiss: Command
  title: ReactNode
  description: ReactNode
  children: ReactNode
  modalMode?: boolean
}

export function ConfirmationPendingContentShell({
  title,
  onDismiss,
  description,
  children: body,
  modalMode,
}: ConfirmationPendingContentShellProps) {
  const statusIcon = useWalletStatusIcon()

  return (
    <Wrapper>
      {modalMode}
      <UpperSection>
        {!modalMode && <BackButtonStyled onClick={onDismiss} />}
        <WalletIcon>{statusIcon}</WalletIcon>
        <span>{title}</span>
        {modalMode && <CloseIcon onClick={onDismiss} />}
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

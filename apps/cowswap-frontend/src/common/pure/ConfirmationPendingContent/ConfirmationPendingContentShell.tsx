/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { AccountIcon } from 'modules/account'

import { Wrapper, CloseIcon, UpperSection, WalletIcon, LowerSection, BackButtonStyled } from './styled'

interface ConfirmationPendingContentShellProps {
  title: ReactNode
  description: ReactNode
  children: ReactNode
  modalMode?: boolean
  /** Hide the back/close button if `onDismiss` is `undefined`. */
  onDismiss?: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmationPendingContentShell({
  title,
  description,
  children: body,
  modalMode,
  onDismiss,
}: ConfirmationPendingContentShellProps) {
  return (
    <Wrapper>
      {modalMode}
      <UpperSection>
        {!modalMode && onDismiss && <BackButtonStyled onClick={onDismiss} />}
        <WalletIcon>
          <AccountIcon size={56} />
        </WalletIcon>
        <span>{title}</span>
        {modalMode && onDismiss && <CloseIcon onClick={onDismiss} />}
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

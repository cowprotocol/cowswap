import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import { CheckCircle, UserCheck } from 'react-feather'

import { ConfirmationPendingContentShell } from './ConfirmationPendingContentShell'
import { StepsWrapper } from './styled'
import { StepsIconWrapper } from './styled'

interface ConfirmationPendingContentProps {
  onDismiss: Command
  title: ReactNode
  description: ReactNode
  operationLabel: string
  modalMode?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmationPendingContent({
  title,
  description,
  operationLabel,
  onDismiss,
  modalMode,
}: ConfirmationPendingContentProps) {
  const walletAddress = useWalletDisplayedAddress()

  const operationSubmittedMessage = `The ${operationLabel} is submitted.`

  return (
    <ConfirmationPendingContentShell
      title={title}
      onDismiss={onDismiss}
      modalMode={modalMode}
      description={
        <>
          <span>{description} </span>
          <br />
          <span>
            <Trans>Follow these steps:</Trans>
          </span>
        </>
      }
    >
      <StepsWrapper>
        <div>
          <StepsIconWrapper>
            <UserCheck />
          </StepsIconWrapper>
          <p>
            <Trans>
              Sign the {operationLabel} with your wallet. {walletAddress && <span>{walletAddress}</span>}
            </Trans>
          </p>
        </div>
        <hr />
        <div>
          <StepsIconWrapper>
            <CheckCircle />
          </StepsIconWrapper>
          <p>{operationSubmittedMessage}</p>
        </div>
      </StepsWrapper>
    </ConfirmationPendingContentShell>
  )
}

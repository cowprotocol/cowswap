import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import { CheckCircle, UserCheck } from 'react-feather'

import { ConfirmationPendingContentShell } from './ConfirmationPendingContentShell'
import { StepsIconWrapper, StepsWrapper } from './styled'

interface ConfirmationPendingContentProps {
  onDismiss: Command
  title: ReactNode
  description: ReactNode
  operationLabel: string
  modalMode?: boolean
  isPendingInProgress?: boolean
}

export function ConfirmationPendingContent({
  title,
  description,
  operationLabel,
  onDismiss,
  modalMode,
  isPendingInProgress,
}: ConfirmationPendingContentProps): ReactNode {
  const walletAddress = useWalletDisplayedAddress()

  const firstStepLabel = isPendingInProgress ? (
    <Trans>The {operationLabel} is signed.</Trans>
  ) : (
    <Trans>
      Sign the {operationLabel} with your wallet. {walletAddress && <span>{walletAddress}</span>}{' '}
    </Trans>
  )

  const secondStepLabel = isPendingInProgress ? (
    <Trans>Waiting for confirmation.</Trans>
  ) : (
    <Trans>The {operationLabel} is submitted.</Trans>
  )

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
          <p>{firstStepLabel}</p>
        </div>
        <hr />
        <div>
          <StepsIconWrapper>
            <CheckCircle />
          </StepsIconWrapper>
          <p>{secondStepLabel}</p>
        </div>
      </StepsWrapper>
    </ConfirmationPendingContentShell>
  )
}

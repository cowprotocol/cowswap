import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'
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
  const { t } = useLingui()

  const firstStepLabel = isPendingInProgress ? (
    t`The ${operationLabel} is signed.`
  ) : (
    <>
      {t`Sign the ${operationLabel} with your wallet.`} {walletAddress && <span>{walletAddress}</span>}{' '}
    </>
  )

  const secondStepLabel = isPendingInProgress ? t`Waiting for confirmation.` : t`The ${operationLabel} is submitted.`

  const animateSecondStep = isPendingInProgress === true

  return (
    <ConfirmationPendingContentShell
      title={title}
      onDismiss={onDismiss}
      modalMode={modalMode}
      description={
        <>
          <span>{description}</span>
          <br />
          <Trans>Follow these steps:</Trans>
        </>
      }
    >
      <StepsWrapper animateSecondStep={animateSecondStep}>
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

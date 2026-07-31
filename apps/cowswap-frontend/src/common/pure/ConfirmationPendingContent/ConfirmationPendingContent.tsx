import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { Loader } from '@cowprotocol/ui'
import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'
import { CheckCircle, UserCheck } from 'react-feather'

import { ConfirmationPendingContentShell } from './ConfirmationPendingContentShell'
import { StepsIconWrapper, StepsWrapper, VerticalStepItem, VerticalStepsWrapper } from './styled'

export interface ConfirmationPendingStep {
  id?: string
  label: ReactNode
  status: ConfirmationPendingStepStatus
  /** When true on an active step, show a spinner (e.g. waiting for tx). */
  loading?: boolean
}

export type ConfirmationPendingStepStatus = 'finished' | 'active' | 'upcoming'

interface ConfirmationPendingContentProps {
  title: ReactNode
  description: ReactNode
  modalMode?: boolean

  /**
   * Legacy 2-step flow (sign → submit). Ignored when `steps` is provided.
   */
  operationLabel?: string
  isPendingInProgress?: boolean

  /**
   * Arbitrary multi-step progress. When set, steps render vertically.
   */
  steps?: ConfirmationPendingStep[]

  /** Hide the back/close button if `onDismiss` is `undefined`. */
  onDismiss?: Command
}

export function ConfirmationPendingContent({
  title,
  description,
  operationLabel,
  modalMode,
  isPendingInProgress,
  steps,
  onDismiss,
}: ConfirmationPendingContentProps): ReactNode {
  const walletAddress = useWalletDisplayedAddress()
  const { t } = useLingui()

  const resolvedSteps =
    steps ?? buildLegacyTwoSteps(operationLabel ?? t`operation`, isPendingInProgress, walletAddress, t)

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
      {steps ? (
        <VerticalStepsList steps={resolvedSteps} />
      ) : (
        <LegacyHorizontalSteps steps={resolvedSteps} animateSecondStep={isPendingInProgress === true} />
      )}
    </ConfirmationPendingContentShell>
  )
}

function buildLegacyTwoSteps(
  operationLabel: string,
  isPendingInProgress: boolean | undefined,
  walletAddress: string | undefined,
  t: ReturnType<typeof useLingui>['t'],
): ConfirmationPendingStep[] {
  const firstStepLabel = isPendingInProgress ? (
    t`The ${operationLabel} is signed.`
  ) : (
    <>
      {t`Sign the ${operationLabel} with your wallet.`} {walletAddress && <span>{walletAddress}</span>}{' '}
    </>
  )

  const secondStepLabel = isPendingInProgress ? t`Waiting for confirmation.` : t`The ${operationLabel} is submitted.`

  return [
    { label: firstStepLabel, status: isPendingInProgress ? 'finished' : 'active' },
    { label: secondStepLabel, status: isPendingInProgress ? 'active' : 'upcoming' },
  ]
}

function LegacyHorizontalSteps({
  steps,
  animateSecondStep,
}: {
  steps: ConfirmationPendingStep[]
  animateSecondStep: boolean
}): ReactNode {
  return (
    <StepsWrapper animateSecondStep={animateSecondStep}>
      <div>
        <StepsIconWrapper>
          <UserCheck />
        </StepsIconWrapper>
        <p>{steps[0]?.label}</p>
      </div>
      <hr />
      <div>
        <StepsIconWrapper>
          <CheckCircle />
        </StepsIconWrapper>
        <p>{steps[1]?.label}</p>
      </div>
    </StepsWrapper>
  )
}

function VerticalStepsList({ steps }: { steps: ConfirmationPendingStep[] }): ReactNode {
  return (
    <VerticalStepsWrapper>
      {steps.map((step, index) => (
        <VerticalStepItem
          key={step.id ?? (typeof step.label === 'string' ? step.label : `step-${index}`)}
          $status={step.status}
        >
          <StepsIconWrapper data-status={step.status} data-loading={step.loading ? 'true' : undefined}>
            {step.status === 'finished' ? (
              <CheckCircle />
            ) : step.status === 'active' && step.loading ? (
              <Loader size="28px" />
            ) : (
              <UserCheck />
            )}
          </StepsIconWrapper>
          <p>{step.label}</p>
        </VerticalStepItem>
      ))}
    </VerticalStepsWrapper>
  )
}

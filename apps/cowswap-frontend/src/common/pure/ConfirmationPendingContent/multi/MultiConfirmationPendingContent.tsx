import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { Loader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { CheckCircle, UserCheck } from 'react-feather'

import { ConfirmationPendingContentShell } from '../ConfirmationPendingContentShell'
import { StepsIconWrapper, VerticalStepItem, VerticalStepsWrapper } from '../styled'

export interface MultiConfirmationPendingStep {
  id?: string
  label: ReactNode
  status: MultiConfirmationPendingStepStatus
  /** When true on an active step, show a spinner (e.g. waiting for tx). */
  loading?: boolean
}

export type MultiConfirmationPendingStepStatus = 'finished' | 'active' | 'upcoming'

interface MultiConfirmationPendingContentProps {
  title: ReactNode
  description: ReactNode
  modalMode?: boolean

  /**
   * Arbitrary multi-step progress.
   */
  steps: MultiConfirmationPendingStep[]

  /** Hide the back/close button if `onDismiss` is `undefined`. */
  onDismiss?: Command
}

export function MultiConfirmationPendingContent({
  title,
  description,
  modalMode,
  steps,
  onDismiss,
}: MultiConfirmationPendingContentProps): ReactNode {
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
      <VerticalStepsList steps={steps} />
    </ConfirmationPendingContentShell>
  )
}

function VerticalStepsList({ steps }: { steps: MultiConfirmationPendingStep[] }): ReactNode {
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

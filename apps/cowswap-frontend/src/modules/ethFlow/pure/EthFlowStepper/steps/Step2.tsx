import { ReactNode, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import Checkmark from 'assets/cow-swap/checkmark.svg'
import Exclamation from 'assets/cow-swap/exclamation.svg'
import Plus from 'assets/cow-swap/plus.svg'
import X from 'assets/cow-swap/x.svg'

import { SmartOrderStatus } from '../constants'
import { EthFlowStepperProps } from '../index'
import { ExplorerLinkStyled, Step, StepProps } from '../Step'

type Step2Config = StepProps & { error?: string }

export function Step2({ order, cancellation, creation }: EthFlowStepperProps): ReactNode {
  const { state, isExpired, orderId, rejectedReason } = order
  const { cancelled: creationCancelled, replaced: creationReplaced } = creation

  const isCreating = state === SmartOrderStatus.CREATING
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isFilled = state === SmartOrderStatus.FILLED
  const isCancelled = cancellation.failed === false
  const isOrderCreated = order.isCreated
  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)
  const hasCreationError = (rejectedReason || creationCancelled || (creationReplaced && isCreating)) && !isFilled

  // Get config for Step 2
  const {
    label,
    state: stepState,
    icon,
    error,
    // TODO: Reduce function complexity by extracting logic
  } = useMemo<Step2Config>(() => {
    // Error states
    if (hasCreationError) {
      return {
        label: t`Order Creation Failed`,
        error: rejectedReason,
        state: 'error',
        icon: X,
      }
    }

    if (expiredBeforeCreate && !isFilled) {
      return {
        label: t`Order Creation Failed`,
        error: t`Expired before creation`,
        state: 'error',
        icon: X,
      }
    }

    if (isCreating) {
      return {
        label: t`Create Order`,
        state: 'not-started',
        icon: Plus,
      }
    }

    if (isIndexing) {
      return {
        label: t`Creating Order`,
        state: 'pending',
        icon: Plus,
      }
    }

    if (isCancelled && !isFilled) {
      return {
        label: t`Order Cancelled`,
        state: 'cancelled',
        icon: Exclamation,
      }
    }

    return {
      label: t`Order Created`,
      state: 'success',
      icon: Checkmark,
    }
  }, [hasCreationError, expiredBeforeCreate, isCancelled, isCreating, isFilled, isIndexing, rejectedReason])

  return (
    <Step state={stepState} icon={icon} label={label} errorMessage={error}>
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label={t`View details`} id={orderId} />}
    </Step>
  )
}

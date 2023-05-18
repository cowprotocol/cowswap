import React, { useMemo } from 'react'
import Plus from '@src/legacy/assets/cow-swap/plus.svg'
import X from '@src/legacy/assets/cow-swap/x.svg'
import Checkmark from '@src/legacy/assets/cow-swap/checkmark.svg'
import Exclamation from '@src/legacy/assets/cow-swap/exclamation.svg'
import { EthFlowStepperProps, SmartOrderStatus } from '..'
import { ExplorerLinkStyled, Step, StepProps } from '../Step'

type Step2Config = StepProps & { error?: string }

export function Step2({ order, cancellation }: EthFlowStepperProps) {
  const { state, isExpired, orderId, rejectedReason } = order
  const isCreating = state === SmartOrderStatus.CREATING
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isCancelled = cancellation.failed === false // if undefined: not cancelled, if true: cancellation failed
  const isOrderCreated = order.isCreated
  const isFilled = state === SmartOrderStatus.FILLED

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  // Get config for Step 2
  const {
    label,
    state: stepState,
    icon,
    error,
  } = useMemo<Step2Config>(() => {
    if (rejectedReason) {
      return {
        label: 'Order Creation Failed',
        error: rejectedReason,
        state: 'error',
        icon: X,
      }
    }
    if (expiredBeforeCreate) {
      return {
        label: 'Order Creation Failed',
        error: 'Expired before creation',
        state: 'error',
        icon: X,
      }
    }

    if (isCreating) {
      return {
        label: 'Create Order',
        state: 'not-started',
        icon: Plus,
      }
    }

    if (isIndexing) {
      return {
        label: 'Creating Order',
        state: 'pending',
        icon: Plus,
      }
    }

    if (isCancelled && !isFilled) {
      return {
        label: 'Order Cancelled',
        state: 'cancelled',
        icon: Exclamation,
      }
    }

    return {
      label: 'Order Created',
      state: 'success',
      icon: Checkmark,
    }
  }, [expiredBeforeCreate, isCancelled, isCreating, isFilled, isIndexing, rejectedReason])

  return (
    <Step state={stepState} icon={icon} label={label} errorMessage={error}>
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />}
    </Step>
  )
}

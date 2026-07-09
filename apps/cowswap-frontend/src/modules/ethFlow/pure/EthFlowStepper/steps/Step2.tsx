import { ReactNode, useMemo } from 'react'

import svgCheckmarkSrc from '@cowprotocol/assets/cow-swap/checkmark.svg'
import svgExclamationSrc from '@cowprotocol/assets/cow-swap/exclamation.svg'
import svgPlusSrc from '@cowprotocol/assets/cow-swap/plus.svg'
import svgXSrc from '@cowprotocol/assets/cow-swap/x.svg'

import { t } from '@lingui/core/macro'

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
        icon: svgXSrc,
      }
    }

    if (expiredBeforeCreate && !isFilled) {
      return {
        label: t`Order Creation Failed`,
        error: t`Expired before creation`,
        state: 'error',
        icon: svgXSrc,
      }
    }

    if (isCreating) {
      return {
        label: t`Create Order`,
        state: 'not-started',
        icon: svgPlusSrc,
      }
    }

    if (isIndexing) {
      return {
        label: t`Creating Order`,
        state: 'pending',
        icon: svgPlusSrc,
      }
    }

    if (isCancelled && !isFilled) {
      return {
        label: t`Order Cancelled`,
        state: 'cancelled',
        icon: svgExclamationSrc,
      }
    }

    return {
      label: t`Order Created`,
      state: 'success',
      icon: svgCheckmarkSrc,
    }
  }, [hasCreationError, expiredBeforeCreate, isCancelled, isCreating, isFilled, isIndexing, rejectedReason])

  return (
    <Step state={stepState} icon={icon} label={label} errorMessage={error}>
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label={t`View details`} id={orderId} />}
    </Step>
  )
}

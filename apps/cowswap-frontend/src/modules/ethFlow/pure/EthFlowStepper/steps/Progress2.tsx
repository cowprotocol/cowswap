import { ReactNode, useMemo } from 'react'

import { SmartOrderStatus } from '../constants'
import { EthFlowStepperProps, Progress, ProgressProps } from '../index'

export function Progress2({ order, creation, refund, cancellation }: EthFlowStepperProps): ReactNode {
  const { state } = order
  const { failed: creationFailed } = creation
  const { hash: refundHash, failed: refundFailed } = refund
  const { hash: cancellationHash, failed: cancellationFailed } = cancellation

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    const hasRefundActivity = !!refundHash || !!cancellationHash
    const isRefundSuccessful =
      (refundHash && refundFailed === false) || (cancellationHash && cancellationFailed === false)
    const isRefundFailed = (refundHash && refundFailed === true) || (cancellationHash && cancellationFailed === true)
    const isNotStarted = state === SmartOrderStatus.CREATING || state === SmartOrderStatus.CREATION_MINED
    const isFilled = state === SmartOrderStatus.FILLED

    // Early returns for terminal states
    if (creationFailed) return { status: 'error', value: 0 }
    if (isRefundFailed) return { status: 'error', value: 100 }
    if (isFilled) return { status: 'success', value: 100 }
    if (isRefundSuccessful) return { status: 'success', value: 100 }

    // In-progress states
    if (hasRefundActivity) return { status: 'pending', value: 66 }

    // Not started or waiting states
    if (isNotStarted) return { status: 'not-started', value: 0 }

    // Default: order indexed, waiting for action
    return { status: 'pending', value: 33 }
  }, [cancellationFailed, cancellationHash, creationFailed, refundFailed, refundHash, state])

  return <Progress status={progressStatus} value={progress} />
}

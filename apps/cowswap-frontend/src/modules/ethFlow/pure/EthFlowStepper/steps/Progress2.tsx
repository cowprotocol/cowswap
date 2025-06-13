import { useMemo } from 'react'

import { EthFlowStepperProps, Progress, ProgressProps, SmartOrderStatus } from '../index'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Progress2({ order, creation, refund, cancellation }: EthFlowStepperProps) {
  const { state } = order
  const { failed: creationFailed } = creation
  const { hash: refundHash, failed: refundFailed } = refund
  const { hash: cancellationHash, failed: cancellationFailed } = cancellation

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    const isIndexing = state === SmartOrderStatus.CREATION_MINED
    const isFilled = state === SmartOrderStatus.FILLED
    const isCreating = state === SmartOrderStatus.CREATING
    const isTerminalState = refundFailed !== undefined || cancellationFailed !== undefined || isFilled

    if (creationFailed) {
      return { status: 'error', value: 0 }
    }

    if (isTerminalState) {
      return { status: 'success', value: 100 }
    }

    if (refundHash || cancellationHash) {
      return { status: 'pending', value: 66 }
    }

    if (isCreating || isIndexing) {
      return { status: 'not-started', value: 0 }
    }

    return { status: 'pending', value: 33 }
  }, [cancellationFailed, cancellationHash, creationFailed, refundFailed, refundHash, state])

  return <Progress status={progressStatus} value={progress} />
}

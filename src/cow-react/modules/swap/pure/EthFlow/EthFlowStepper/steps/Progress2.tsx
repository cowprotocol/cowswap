import React, { useMemo } from 'react'
import { Progress, EthFlowStepperProps, SmartOrderStatus, ProgressProps } from '..'

export function Progress2({ order, refund, cancellation }: EthFlowStepperProps) {
  const { state } = order
  const { isRefunded, refundTx } = refund
  const { isCancelled, cancellationTx } = cancellation

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    const isIndexing = state === SmartOrderStatus.CREATION_MINED
    const isFilled = state === SmartOrderStatus.FILLED
    const isCreating = state === SmartOrderStatus.CREATING
    const isTerminalState = isRefunded || isCancelled || isFilled

    if (isTerminalState) {
      return {
        status: 'success',
        value: 100,
      }
    }

    if (refundTx || cancellationTx) {
      return {
        status: 'pending',
        value: 66,
      }
    }

    if (isCreating || isIndexing) {
      return {
        status: 'not-started',
        value: 0,
      }
    }

    if (refundTx || cancellationTx) {
      return {
        status: 'pending',
        value: 66,
      }
    }

    return {
      status: 'pending',
      value: 33,
    }
  }, [state, refundTx, cancellationTx, isCancelled, isRefunded])

  return <Progress status={progressStatus} value={progress} />
}

import React, { useMemo } from 'react'
import { Progress, EthFlowStepperProps, SmartOrderStatus, ProgressProps } from '..'

export function Progress2({ order, refund, cancelation }: EthFlowStepperProps) {
  const { state } = order
  const { isRefunded, refundTx } = refund
  const { isCanceled, cancelationTx } = cancelation

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    const isIndexing = state === SmartOrderStatus.CREATION_MINED
    const isFilled = state === SmartOrderStatus.FILLED
    const isCreating = state === SmartOrderStatus.CREATING
    const isTerminalState = isRefunded || isCanceled || isFilled

    if (isTerminalState) {
      return {
        status: 'success',
        value: 100,
      }
    }

    if (refundTx || cancelationTx) {
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

    if (refundTx || cancelationTx) {
      return {
        status: 'pending',
        value: 66,
      }
    }

    return {
      status: 'pending',
      value: 33,
    }
  }, [state, refundTx, cancelationTx, isCanceled, isRefunded])

  return <Progress status={progressStatus} value={progress} max={100} />
}

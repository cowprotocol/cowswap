import React from 'react'
import { Progress, EthFlowStepperProps, SmartOrderStatus } from '..'

export function Progress2({ order, refund, cancelation }: EthFlowStepperProps) {
  const { state } = order
  const { isRefunded, refundTx } = refund
  const { isCanceled, cancelationTx } = cancelation
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isFilled = state === SmartOrderStatus.FILLED
  const isCreating = state === SmartOrderStatus.CREATING

  const isTerminalState = isRefunded || isCanceled || isFilled
  let progress: number
  if (isTerminalState) {
    progress = 100
  } else if (refundTx || cancelationTx) {
    progress = 66
  } else if (isCreating || isIndexing) {
    progress = 0
  } else {
    if (refundTx || cancelationTx) {
      progress = 66
    } else {
      progress = 33
    }
  }
  return <Progress value={progress} max={100} />
}

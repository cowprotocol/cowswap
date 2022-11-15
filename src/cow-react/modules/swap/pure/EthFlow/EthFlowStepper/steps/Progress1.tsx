import React from 'react'
import { Progress, EthFlowStepperProps, SmartOrderStatus } from '..'
import { StatusIconState } from '../StatusIcon'

export function Progress1({ order }: EthFlowStepperProps) {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING

  let progress: number, status: StatusIconState
  if (isCreating) {
    if (isExpired) {
      progress = 100
      status = 'error'
    } else {
      progress = 50
      status = 'pending'
    }
  } else {
    progress = 100
    status = 'pending'
  }

  return <Progress className={status} value={progress} max={100} />
}

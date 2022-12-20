import React, { useMemo } from 'react'
import { EthFlowStepperProps, Progress, ProgressProps, SmartOrderStatus } from '..'

export function Progress1({ order }: EthFlowStepperProps) {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING
  const isInvalid = state === SmartOrderStatus.INVALID

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    if (isInvalid) {
      return { value: 0, status: 'error' }
    }
    if (isCreating) {
      if (isExpired) {
        return {
          value: 100,
          status: 'error',
        }
      }

      return {
        value: 50,
        status: 'pending',
      }
    }

    return {
      value: 100,
      status: 'pending',
    }
  }, [isCreating, isExpired, isInvalid])

  return <Progress status={progressStatus} value={progress} />
}

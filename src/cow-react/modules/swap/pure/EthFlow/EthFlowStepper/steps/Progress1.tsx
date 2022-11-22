import React, { useMemo } from 'react'
import { Progress, EthFlowStepperProps, SmartOrderStatus, ProgressProps } from '..'

export function Progress1({ order }: EthFlowStepperProps) {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
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
  }, [isCreating, isExpired])

  return <Progress status={progressStatus} value={progress} max={100} />
}

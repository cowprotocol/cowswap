import { useMemo } from 'react'

import { EthFlowStepperProps, Progress, ProgressProps, SmartOrderStatus } from '../index'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Progress1({ order, creation }: EthFlowStepperProps) {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING
  const { failed } = creation

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    if (failed) {
      return { value: 0, status: 'error' }
    }
    if (isCreating) {
      if (isExpired) {
        return { value: 100, status: 'error' }
      }

      return { value: 50, status: 'pending' }
    }

    return { value: 100, status: 'pending' }
  }, [failed, isCreating, isExpired])

  return <Progress status={progressStatus} value={progress} />
}

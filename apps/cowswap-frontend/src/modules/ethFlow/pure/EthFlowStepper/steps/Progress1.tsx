import { ReactNode, useMemo } from 'react'

import { SmartOrderStatus } from '../constants'
import { EthFlowStepperProps, Progress, ProgressProps } from '../index'

export function Progress1({ order, creation }: EthFlowStepperProps): ReactNode {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING
  const { failed } = creation

  const { status: progressStatus, value: progress } = useMemo<ProgressProps>(() => {
    const isCreationFailed = failed === true
    const isCreationExpired = isCreating && isExpired
    const isCreationInProgress = isCreating && !isExpired
    const isCreationCompleted = !isCreating

    // Early returns for error states
    if (isCreationFailed) return { value: 0, status: 'error' }
    if (isCreationExpired) return { value: 100, status: 'error' }

    // In-progress state
    if (isCreationInProgress) return { value: 50, status: 'pending' }

    // Completed state
    if (isCreationCompleted) return { value: 100, status: 'success' }

    // Fallback (should never reach here)
    return { value: 0, status: 'pending' }
  }, [failed, isCreating, isExpired])

  return <Progress status={progressStatus} value={progress} />
}

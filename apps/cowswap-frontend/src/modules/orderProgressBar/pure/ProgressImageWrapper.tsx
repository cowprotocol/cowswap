import { ReactNode } from 'react'

import { GapMap, PaddingMap, PROCESS_IMAGE_WRAPPER_BG_COLOR } from './constants'

import { ProgressImageWrapper as ProgressImageWrapperEl } from '../sharedStyled'
import { OrderProgressBarProps } from '../types'

interface ProgressImageWrapperProps {
  children: React.ReactNode
  stepName: OrderProgressBarProps['stepName']
}

const PROCESS_IMAGE_WRAPPER_PADDING: PaddingMap = {
  initial: '0',
  unfillable: '0',
  delayed: '0',
  submissionFailed: '0',
  solved: '0',
  solving: '12px',
  finished: '10px',
  cancellationFailed: '10px',
  executing: undefined,
  cancelling: undefined,
  cancelled: undefined,
  expired: undefined,
  bridgingFinished: undefined,
  bridgingFailed: undefined,
  bridgingInProgress: undefined,
  refundCompleted: undefined,
}

const PROCESS_IMAGE_WRAPPER_GAP: GapMap = {
  finished: '10px',
  cancellationFailed: '10px',
  initial: undefined,
  solving: undefined,
  executing: undefined,
  cancelling: undefined,
  cancelled: undefined,
  expired: undefined,
  unfillable: undefined,
  delayed: undefined,
  submissionFailed: undefined,
  solved: undefined,
  bridgingFinished: undefined,
  bridgingFailed: undefined,
  bridgingInProgress: undefined,
  refundCompleted: undefined,
}

export function ProgressImageWrapper({ children, stepName, ...props }: ProgressImageWrapperProps): ReactNode {
  return (
    <ProgressImageWrapperEl
      bgColor={stepName ? PROCESS_IMAGE_WRAPPER_BG_COLOR[stepName] : undefined}
      padding={stepName ? PROCESS_IMAGE_WRAPPER_PADDING[stepName] : '0'}
      gap={stepName ? PROCESS_IMAGE_WRAPPER_GAP[stepName] : '0'}
      {...props}
    >
      {children}
    </ProgressImageWrapperEl>
  )
}

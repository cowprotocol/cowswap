import { UI } from '@cowprotocol/ui'

import { ProgressImageWrapper as ProgressImageWrapperEl } from '../sharedStyled'
import { OrderProgressBarProps } from '../types'

interface ProgressImageWrapperProps {
  children: React.ReactNode
  stepName: OrderProgressBarProps['stepName']
}

type StepName = OrderProgressBarProps['stepName']
type BgColorMap = Record<NonNullable<StepName>, string | undefined>
type PaddingMap = Record<NonNullable<StepName>, string | undefined>
type HeightMap = Record<NonNullable<StepName>, string | undefined>
type GapMap = Record<NonNullable<StepName>, string | undefined>

const PROCESS_IMAGE_WRAPPER_BG_COLOR: BgColorMap = {
  initial: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  unfillable: '#FFDB9C',
  delayed: '#FFB3B3',
  submissionFailed: '#FFB3B3',
  solved: '#FFB3B3',
  solving: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  finished: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  cancellationFailed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  executing: undefined,
  cancelling: undefined,
  cancelled: undefined,
  expired: undefined,
  bridgingFinished: undefined,
  bridgingFailed: undefined,
  bridgingInProgress: undefined,
  refundCompleted: undefined,
}

const PROCESS_IMAGE_WRAPPER_PADDING: PaddingMap = {
  initial: '24px',
  unfillable: '20px 0 0',
  delayed: '0',
  submissionFailed: '0',
  solved: '0',
  solving: '16px',
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

const PROCESS_IMAGE_WRAPPER_HEIGHT: HeightMap = {
  delayed: '229px',
  submissionFailed: '229px',
  solved: '229px',
  finished: '229px',
  initial: undefined,
  solving: 'auto',
  executing: 'auto',
  cancelling: undefined,
  cancelled: undefined,
  expired: undefined,
  unfillable: 'auto',
  cancellationFailed: undefined,
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

export function ProgressImageWrapper({ children, stepName, ...props }: ProgressImageWrapperProps) {
  return (
    <ProgressImageWrapperEl
      bgColor={stepName ? PROCESS_IMAGE_WRAPPER_BG_COLOR[stepName] : undefined}
      padding={stepName ? PROCESS_IMAGE_WRAPPER_PADDING[stepName] : '0'}
      height={stepName ? PROCESS_IMAGE_WRAPPER_HEIGHT[stepName] : 'auto'}
      gap={stepName ? PROCESS_IMAGE_WRAPPER_GAP[stepName] : '0'}
      {...props}
    >
      {children}
    </ProgressImageWrapperEl>
  )
}

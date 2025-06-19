import { ReactNode } from 'react'

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
type GapMap = Record<NonNullable<StepName>, string | undefined>

const PROCESS_IMAGE_WRAPPER_BG_COLOR: BgColorMap = {
  initial: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  unfillable: '#FFDB9C',
  delayed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  submissionFailed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  solved: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  solving: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  finished: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  cancellationFailed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  executing: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  cancelling: '#f0dede',
  cancelled: '#f0dede',
  expired: `var(${UI.COLOR_ALERT_BG})`,
  bridgingFinished: undefined,
  bridgingFailed: undefined,
  bridgingInProgress: undefined,
  refundCompleted: undefined,
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

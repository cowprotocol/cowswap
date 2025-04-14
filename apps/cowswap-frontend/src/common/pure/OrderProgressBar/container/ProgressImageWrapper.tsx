import { Color } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { OrderProgressBarProps } from '../types'

interface ProgressImageWrapperProps {
  children: React.ReactNode
  stepName: OrderProgressBarProps['stepName']
}

type StepName = OrderProgressBarProps['stepName']
type BgColorMap = Partial<Record<NonNullable<StepName>, string>>
type PaddingMap = Partial<Record<NonNullable<StepName>, string>>
type HeightMap = Partial<Record<NonNullable<StepName>, string | 'auto'>>
type GapMap = Partial<Record<NonNullable<StepName>, string>>

const PROCESS_IMAGE_WRAPPER_BG_COLOR: BgColorMap = {
  initial: Color.cowfi_blue_lighter,
  unfillable: '#FFDB9C',
  delayed: '#FFB3B3',
  submissionFailed: '#FFB3B3',
  solved: '#FFB3B3',
  solving: Color.cowfi_blue_lighter,
  finished: Color.cowfi_blue_lighter,
  cancellationFailed: Color.cowfi_blue_lighter,
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
}

const PROCESS_IMAGE_WRAPPER_HEIGHT: HeightMap = {
  delayed: '229px',
  submissionFailed: '229px',
  solved: '229px',
  finished: '229px',
}

const PROCESS_IMAGE_WRAPPER_GAP: GapMap = {
  finished: '10px',
  cancellationFailed: '10px',
}

export function ProgressImageWrapper({ children, stepName, ...props }: ProgressImageWrapperProps) {
  return (
    <styledEl.ProgressImageWrapper
      bgColor={stepName ? PROCESS_IMAGE_WRAPPER_BG_COLOR[stepName] : undefined}
      padding={stepName ? PROCESS_IMAGE_WRAPPER_PADDING[stepName] : '0'}
      height={stepName ? PROCESS_IMAGE_WRAPPER_HEIGHT[stepName] : 'auto'}
      gap={stepName ? PROCESS_IMAGE_WRAPPER_GAP[stepName] : '0'}
      {...props}
    >
      {children}
    </styledEl.ProgressImageWrapper>
  )
}

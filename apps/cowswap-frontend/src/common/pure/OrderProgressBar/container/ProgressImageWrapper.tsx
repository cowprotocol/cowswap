import { Color } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { OrderProgressBarV2Props } from '../types'

interface ProgressImageWrapperProps {
  children: React.ReactNode
  stepName: OrderProgressBarV2Props['stepName']
}

function getProgressImageWrapperBgColor(stepName: OrderProgressBarV2Props['stepName']) {
  switch (stepName) {
    case 'initial':
      return Color.cowfi_blue_lighter
    case 'unfillable':
      return '#FFDB9C'
    case 'delayed':
    case 'submissionFailed':
    case 'solved':
      return '#FFB3B3'
    case 'solving':
      return Color.cowfi_blue_lighter
    case 'finished':
    case 'cancellationFailed':
      return Color.cowfi_blue_lighter
    default:
      return undefined
  }
}

function getProgressImageWrapperPadding(stepName: OrderProgressBarV2Props['stepName']) {
  switch (stepName) {
    case 'initial':
      return '24px'
    case 'unfillable':
      return '20px 0 0'
    case 'delayed':
    case 'submissionFailed':
    case 'solved':
      return '0'
    case 'solving':
      return '16px'
    case 'finished':
    case 'cancellationFailed':
      return '10px'
    default:
      return '0'
  }
}

function getProgressImageWrapperGap(stepName: OrderProgressBarV2Props['stepName']) {
  switch (stepName) {
    case 'finished':
    case 'cancellationFailed':
      return '10px'
    default:
      return '0'
  }
}

function getProgressImageWrapperHeight(stepName: OrderProgressBarV2Props['stepName']) {
  switch (stepName) {
    case 'delayed':
    case 'submissionFailed':
    case 'solved':
    case 'finished':
      return '229px'
    default:
      return 'auto'
  }
}

export function ProgressImageWrapper({ children, stepName, ...props }: ProgressImageWrapperProps) {
  return (
    <styledEl.ProgressImageWrapper
      bgColor={getProgressImageWrapperBgColor(stepName)}
      padding={getProgressImageWrapperPadding(stepName)}
      height={getProgressImageWrapperHeight(stepName)}
      gap={getProgressImageWrapperGap(stepName)}
      {...props}
    >
      {children}
    </styledEl.ProgressImageWrapper>
  )
}

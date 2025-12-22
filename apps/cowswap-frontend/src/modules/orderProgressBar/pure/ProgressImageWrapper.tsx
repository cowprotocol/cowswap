import { ReactNode } from 'react'

import {
  PROCESS_IMAGE_WRAPPER_BG_COLOR,
  PROCESS_IMAGE_WRAPPER_PADDING,
  PROCESS_IMAGE_WRAPPER_GAP,
} from './ProgressImageWrapper/constants'

import { ProgressImageWrapper as ProgressImageWrapperEl } from '../sharedStyled'
import { OrderProgressBarProps } from '../types'

export { PROCESS_IMAGE_WRAPPER_BG_COLOR }

interface ProgressImageWrapperProps {
  children: React.ReactNode
  stepName: OrderProgressBarProps['stepName']
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

import { ReactNode } from 'react'

import { buttonSx } from './Button.styles'

import { BaseButton } from '../base/BaseButton.component'

import type { SxProps, Theme } from '@mui/material/styles'
import type { Icon } from 'react-feather'

export interface ButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  endIcon?: Icon
  type?: 'button' | 'submit'
  'aria-label'?: string
  sx?: SxProps<Theme>
}

export function Button(props: ButtonProps): ReactNode {
  return <BaseButton {...props} buttonSx={buttonSx} />
}

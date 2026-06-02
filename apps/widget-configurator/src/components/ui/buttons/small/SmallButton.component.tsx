import { ReactNode } from 'react'

import { smallButtonSx } from './SmallButton.styles'

import { BaseButton } from '../base/BaseButton.component'

import type { SxProps, Theme } from '@mui/material/styles'
import type { Icon } from 'react-feather'

export interface SmallButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  endIcon?: Icon
  type?: 'button' | 'submit'
  'aria-label'?: string
  sx?: SxProps<Theme>
}

export function SmallButton(props: SmallButtonProps): ReactNode {
  return <BaseButton {...props} buttonSx={smallButtonSx} />
}

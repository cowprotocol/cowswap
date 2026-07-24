import { ReactNode } from 'react'

import { linkButtonSx } from './LinkButton.styles'

import { BaseButton } from '../base/BaseButton.component'

import type { SxProps, Theme } from '@mui/material/styles'
import type { Icon } from 'react-feather'

export interface LinkButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  endIcon?: Icon
  type?: 'button' | 'submit'
  'aria-label'?: string
  sx?: SxProps<Theme>
}

export function LinkButton(props: LinkButtonProps): ReactNode {
  return <BaseButton {...props} buttonSx={linkButtonSx} />
}

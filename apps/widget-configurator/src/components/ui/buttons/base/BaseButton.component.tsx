import { ReactNode } from 'react'

import MuiButton from '@mui/material/Button'

import { BUTTON_ICON_SIZE, BUTTON_ICON_STROKE_WIDTH } from './BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'
import type { Icon } from 'react-feather'

export interface BaseButtonProps {
  label: string
  buttonSx: SxProps<Theme>
  onClick?: () => void
  disabled?: boolean
  endIcon?: Icon
  type?: 'button' | 'submit'
  'aria-label'?: string
  sx?: SxProps<Theme>
}

export function BaseButton({
  label,
  buttonSx,
  onClick,
  disabled,
  endIcon: EndIcon,
  type = 'button',
  'aria-label': ariaLabel,
  sx,
}: BaseButtonProps): ReactNode {
  return (
    <MuiButton
      type={type}
      variant="text"
      disableElevation
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      endIcon={
        EndIcon ? <EndIcon size={BUTTON_ICON_SIZE} strokeWidth={BUTTON_ICON_STROKE_WIDTH} aria-hidden /> : undefined
      }
      sx={[buttonSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      {label}
    </MuiButton>
  )
}

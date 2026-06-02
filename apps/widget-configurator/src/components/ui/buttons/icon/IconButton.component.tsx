import { forwardRef, ReactNode } from 'react'

import Box from '@mui/material/Box'
import MuiIconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { iconButtonSx } from './IconButton.styles'

import { BUTTON_ICON_SIZE, BUTTON_ICON_STROKE_WIDTH } from '../base/BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'
import type { Icon } from 'react-feather'

export interface IconButtonProps {
  icon: Icon
  tooltip: string
  'aria-label': string
  onClick?: () => void
  disabled?: boolean
  'aria-busy'?: boolean
  sx?: SxProps<Theme>
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: IconComponent, tooltip, 'aria-label': ariaLabel, onClick, disabled, 'aria-busy': ariaBusy, sx },
  ref,
): ReactNode {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <MuiIconButton
          ref={ref}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-busy={ariaBusy}
          size="small"
          sx={[iconButtonSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
        >
          <IconComponent size={BUTTON_ICON_SIZE} strokeWidth={BUTTON_ICON_STROKE_WIDTH} aria-hidden />
        </MuiIconButton>
      </Box>
    </Tooltip>
  )
})

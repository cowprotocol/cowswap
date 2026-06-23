import type { SxProps, Theme } from '@mui/material/styles'

export const BUTTON_ICON_SIZE = 20
export const BUTTON_ICON_STROKE_WIDTH = 2

export const labelledButtonTypographySx = {
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  color: 'text.primary',
} as const satisfies SxProps<Theme>

export const sharedBorderSx = {
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
} as const satisfies SxProps<Theme>

export const mediumButtonSizeSx = {
  pl: 1.5,
  pr: 2,
  py: 1,
  height: 40,
} as const satisfies SxProps<Theme>

export const smallButtonSizeSx = {
  p: 1,
  height: 32,
  minWidth: 32,
} as const satisfies SxProps<Theme>

export const mediumEndIconSpacingSx = {
  '& .MuiButton-endIcon': { ml: 1.5 },
} as const satisfies SxProps<Theme>

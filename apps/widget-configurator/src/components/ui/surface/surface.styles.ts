import type { PopoverProps } from '@mui/material/Popover'
import type { SxProps, Theme } from '@mui/material/styles'

/** Shared paper surface for configurator dialogs and other elevated panels. */
export const configuratorSurfacePaperSx: SxProps<Theme> = {
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
  backgroundImage: 'none',
}

export const configuratorSurfacePaperProps = {
  elevation: 0,
  sx: configuratorSurfacePaperSx,
} as const

export const configuratorSurfacePopoverProps: Pick<PopoverProps, 'PaperProps'> = {
  PaperProps: configuratorSurfacePaperProps,
}

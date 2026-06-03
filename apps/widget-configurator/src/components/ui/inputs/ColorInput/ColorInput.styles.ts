import { configuratorSurfacePaperProps, configuratorSurfacePaperSx } from '../../surface/surface.styles'

import type { PopoverProps } from '@mui/material/Popover'
import type { SxProps, Theme } from '@mui/material/styles'

/** ColorInput-only overrides; compose flat with {@link baseTextInputSx} in the component. */
export const colorInputAdornedInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-input.MuiInputBase-inputAdornedStart': {
    paddingLeft: 0,
  },
}

export const colorInputPopoverPaperSx: SxProps<Theme> = {
  ...(configuratorSurfacePaperSx as Extract<SxProps<Theme>, Record<string, unknown>>),
  '& .MuiColorInput-ColorSpace': {
    aspectRatio: '1 / 1',
    height: 'auto',
  },
}

export const colorInputPopoverProps: Pick<PopoverProps, 'PaperProps' | 'transitionDuration' | 'TransitionProps'> = {
  transitionDuration: 0,
  TransitionProps: {
    timeout: 0,
  },
  PaperProps: {
    ...configuratorSurfacePaperProps,
    sx: colorInputPopoverPaperSx,
  },
}

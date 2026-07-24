import { alpha } from '@mui/material/styles'

import { configuratorSurfacePaperSx } from '../surface.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const configuratorDialogBackdropSx: SxProps<Theme> = (theme) => {
  const backdropAlpha = theme.palette.mode === 'light' ? 0.25 : 0.85

  return {
    backgroundColor: alpha(theme.palette.common.black, backdropAlpha),
    backdropFilter: 'blur(8px)',
  }
}

export const configuratorDialogPaperSx: SxProps<Theme> = {
  ...configuratorSurfacePaperSx,
  overflow: 'hidden',
  width: '100%',
  maxWidth: 600,
  m: 2,
}

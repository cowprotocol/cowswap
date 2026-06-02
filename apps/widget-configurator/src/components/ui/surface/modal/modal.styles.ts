import { configuratorSurfacePaperSx } from '../surface.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const configuratorDialogPaperSx: SxProps<Theme> = {
  ...configuratorSurfacePaperSx,
  overflow: 'hidden',
  width: '100%',
  maxWidth: 600,
  m: 2,
}

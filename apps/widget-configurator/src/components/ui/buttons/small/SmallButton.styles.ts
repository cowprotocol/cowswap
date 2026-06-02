import { labelledButtonTypographySx, sharedBorderSx, smallButtonSizeSx } from '../base/BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const smallButtonSx = {
  ...sharedBorderSx,
  ...labelledButtonTypographySx,
  ...smallButtonSizeSx,
} satisfies SxProps<Theme>

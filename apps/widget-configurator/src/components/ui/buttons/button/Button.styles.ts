import {
  labelledButtonTypographySx,
  mediumButtonSizeSx,
  mediumEndIconSpacingSx,
  sharedBorderSx,
} from '../base/BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const buttonSx = {
  ...sharedBorderSx,
  ...labelledButtonTypographySx,
  ...mediumButtonSizeSx,
  ...mediumEndIconSpacingSx,
} satisfies SxProps<Theme>

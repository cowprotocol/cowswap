import {
  labelledButtonTypographySx,
  mediumButtonSizeSx,
  mediumEndIconSpacingSx,
  sharedBorderSx,
} from '../base/BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const buttonSx: SxProps<Theme> = {
  ...sharedBorderSx,
  ...labelledButtonTypographySx,
  ...mediumButtonSizeSx,
  ...mediumEndIconSpacingSx,
}

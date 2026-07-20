import { labelledButtonTypographySx, smallButtonSizeSx } from '../base/BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const linkButtonSx: SxProps<Theme> = {
  ...labelledButtonTypographySx,
  ...smallButtonSizeSx,
  border: 'none',
  minWidth: 'unset',
  width: 'auto',
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
  textUnderlineOffset: 2,
  '&:hover': {
    backgroundColor: 'transparent',
    textDecorationStyle: 'solid',
  },
}

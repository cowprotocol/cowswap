import { labelledButtonTypographySx } from '../../buttons/base/BaseButton.styles'

import type { SxProps, Theme } from '@mui/material/styles'

/** Matches Get code button label typography; applied on the unit span, not the adornment root. */
export const numberInputUnitTypographySx: SxProps<Theme> = {
  ...labelledButtonTypographySx,
  color: 'text.secondary',
  lineHeight: 1,
  whiteSpace: 'nowrap',
}

/** NumberInput-only overrides when a unit adornment is shown on the right. */
export const numberInputUnitAdornedSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-input.MuiInputBase-inputAdornedEnd': {
    paddingRight: 0,
  },
  '& .MuiInputAdornment-positionEnd': {
    marginLeft: 0,
    maxHeight: 'none',
    height: 'auto',
    alignSelf: 'center',
  },
}

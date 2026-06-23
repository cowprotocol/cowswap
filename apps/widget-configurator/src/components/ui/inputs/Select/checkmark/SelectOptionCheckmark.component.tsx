import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import { Check, CheckSquare, Square } from 'react-feather'

import { selectOptionCheckIconSx, selectOptionCheckPlaceholderSx } from '../base/BaseSelectInput.styles'

const SELECT_OPTION_CHECK_SIZE = 18
const SELECT_OPTION_CHECK_STROKE_WIDTH = 2

type SelectOptionCheckmarkVariant = 'check' | 'checkbox'

interface SelectOptionCheckmarkProps {
  selected: boolean
  variant?: SelectOptionCheckmarkVariant
}

export function SelectOptionCheckmark({ selected, variant = 'check' }: SelectOptionCheckmarkProps): ReactNode {
  if (variant === 'checkbox') {
    const CheckboxIcon = selected ? CheckSquare : Square

    return (
      <Box component="span" sx={selectOptionCheckIconSx} aria-hidden>
        <CheckboxIcon size={SELECT_OPTION_CHECK_SIZE} strokeWidth={SELECT_OPTION_CHECK_STROKE_WIDTH} />
      </Box>
    )
  }

  if (selected) {
    return (
      <Box component="span" sx={selectOptionCheckIconSx} aria-hidden>
        <Check size={SELECT_OPTION_CHECK_SIZE} strokeWidth={SELECT_OPTION_CHECK_STROKE_WIDTH} />
      </Box>
    )
  }

  return <Box sx={selectOptionCheckPlaceholderSx} aria-hidden />
}

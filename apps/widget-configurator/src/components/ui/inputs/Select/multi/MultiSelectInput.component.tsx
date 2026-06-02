import { type ReactNode, useCallback } from 'react'

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'

import { BaseSelectInput } from '../base/BaseSelectInput.component'
import { selectOptionCheckboxSx, selectOptionLabelSx, selectOptionRowSx } from '../base/BaseSelectInput.styles'
import { getOptionLabel, renderMultiOptionValue } from '../base/BaseSelectInput.utils'

import type { BaseSelectInputProps, PrimitiveValue, SelectInputOption } from '../base/BaseSelectInput.types'
import type { SelectProps } from '@mui/material/Select'

export interface MultiSelectInputProps<TValue extends PrimitiveValue = string> extends BaseSelectInputProps<TValue> {
  value: TValue[]
  onChange: (name: string, value: TValue[]) => void
  menuProps?: SelectProps['MenuProps']
  withSeparator?: boolean
}

export function MultiSelectInput<TValue extends PrimitiveValue = string>({
  name,
  label,
  value,
  options,
  onChange,
  emptyLabel,
  disabled = false,
  menuProps,
  withSeparator = true,
}: MultiSelectInputProps<TValue>): ReactNode {
  const renderSelectedValue = useCallback(
    (selectedOptions: SelectInputOption<TValue>[], emptyDisplayLabel?: string): ReactNode =>
      renderMultiOptionValue(selectedOptions, emptyDisplayLabel, withSeparator),
    [withSeparator],
  )

  return (
    <BaseSelectInput
      name={name}
      label={label}
      options={options}
      disabled={disabled}
      emptyLabel={emptyLabel}
      multiple={true}
      multilineSelectedValue={true}
      inputLabelShrink={true}
      menuProps={menuProps}
      value={value}
      onChange={onChange}
      renderSelectedValue={renderSelectedValue}
      renderMenuItemContent={(option, selected) => renderMultiOptionContent(option, selected)}
    />
  )
}

function renderMultiOptionContent<TValue extends PrimitiveValue>(
  option: SelectInputOption<TValue>,
  selected: boolean,
): ReactNode {
  return (
    <Box sx={selectOptionRowSx}>
      <Box sx={selectOptionLabelSx}>{getOptionLabel(option)}</Box>
      <Checkbox
        checked={selected}
        sx={selectOptionCheckboxSx}
        disableRipple
        tabIndex={-1}
        inputProps={{ 'aria-hidden': true }}
      />
    </Box>
  )
}

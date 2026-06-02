import type { ReactNode } from 'react'

import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'

import { BaseSelectInput } from '../base/BaseSelectInput.component'
import {
  selectOptionCheckIconSx,
  selectOptionCheckPlaceholderSx,
  selectOptionLabelSx,
  selectOptionRowSx,
} from '../base/BaseSelectInput.styles'
import { getOptionLabel, hasEmptyLabel, renderSingleOptionValue } from '../base/BaseSelectInput.utils'

import type { BaseSelectInputProps, PrimitiveValue, SelectInputOption } from '../base/BaseSelectInput.types'

export type SelectInputProps<TValue extends PrimitiveValue = string> =
  | (BaseSelectInputProps<TValue> & {
      emptyLabel?: false
      value: TValue
      onChange: (name: string, value: TValue) => void
    })
  | (BaseSelectInputProps<TValue> & {
      emptyLabel: string | true
      value: TValue | ''
      onChange: (name: string, value: TValue | '') => void
    })

export function SelectInput<TValue extends PrimitiveValue = string>({
  name,
  label,
  value,
  options,
  onChange,
  emptyLabel,
  disabled = false,
}: SelectInputProps<TValue>): ReactNode {
  const handleChange = (fieldName: string, fieldValue: TValue | ''): void => {
    if (hasEmptyLabel(emptyLabel)) {
      const notifyChange = onChange as (name: string, value: TValue | '') => void
      notifyChange(fieldName, fieldValue)
      return
    }

    if (fieldValue === '') return

    const notifyChange = onChange as (name: string, value: TValue) => void
    notifyChange(fieldName, fieldValue)
  }

  return (
    <BaseSelectInput
      name={name}
      label={label}
      options={options}
      disabled={disabled}
      emptyLabel={emptyLabel}
      inputLabelShrink={hasEmptyLabel(emptyLabel) || undefined}
      value={value}
      onChange={handleChange}
      renderSelectedValue={renderSingleOptionValue}
      renderMenuItemContent={(option, selected) => renderSingleOptionContent(option, selected)}
    />
  )
}

function renderSingleOptionContent<TValue extends PrimitiveValue>(
  option: SelectInputOption<TValue>,
  selected: boolean,
): ReactNode {
  return (
    <Box sx={selectOptionRowSx}>
      <Box sx={selectOptionLabelSx}>{getOptionLabel(option)}</Box>
      {selected ? (
        <CheckIcon sx={selectOptionCheckIconSx} fontSize="small" />
      ) : (
        <Box sx={selectOptionCheckPlaceholderSx} />
      )}
    </Box>
  )
}

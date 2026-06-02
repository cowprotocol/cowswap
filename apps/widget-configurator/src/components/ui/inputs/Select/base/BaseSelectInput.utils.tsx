import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'

import {
  multiSelectValueItemSx,
  selectMultipleSelectedValueSx,
  selectOptionLabelContentSx,
} from './BaseSelectInput.styles'

import type { PrimitiveValue, SelectInputOption } from './BaseSelectInput.types'

function SelectOptionLabel({ label }: { label: string }): ReactNode {
  return <ListItemText primary={label} disableTypography sx={selectOptionLabelContentSx} />
}

export function getOptionLabel<TValue extends PrimitiveValue>(option: SelectInputOption<TValue>): ReactNode {
  if (!option.icon) {
    return option.label
  }

  const Icon = option.icon

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: '1 1 auto' }}>
      <Icon />
      <SelectOptionLabel label={option.label} />
    </Box>
  )
}

export function resolveEmptyDisplayLabel<TValue extends PrimitiveValue>(
  emptyLabel: string | boolean | undefined,
  options: readonly SelectInputOption<TValue>[],
): string | undefined {
  if (emptyLabel === undefined || emptyLabel === false) return undefined
  if (typeof emptyLabel === 'string') return emptyLabel

  return options.find((option) => option.value === '')?.label ?? ''
}

export function hasEmptyLabel(emptyLabel: string | boolean | undefined): emptyLabel is string | true {
  return emptyLabel !== undefined && emptyLabel !== false
}

export function renderSingleOptionValue<TValue extends PrimitiveValue>(
  selectedOption: SelectInputOption<TValue> | undefined,
  emptyDisplayLabel?: string,
): ReactNode {
  if (!selectedOption) return emptyDisplayLabel ?? ''

  return getOptionLabel(selectedOption)
}

export function renderMultiOptionValue<TValue extends PrimitiveValue>(
  selectedOptions: readonly SelectInputOption<TValue>[],
  emptyDisplayLabel?: string,
  withSeparator = true,
): ReactNode {
  if (selectedOptions.length === 0) {
    return emptyDisplayLabel ?? ''
  }

  if (withSeparator) {
    return <Box sx={selectMultipleSelectedValueSx}>{selectedOptions.map((option) => option.label).join(', ')}</Box>
  }

  return (
    <Box sx={selectMultipleSelectedValueSx}>
      {selectedOptions.map((option) => (
        <Box key={String(option.value)} component="span" sx={multiSelectValueItemSx}>
          {getOptionLabel(option)}
        </Box>
      ))}
    </Box>
  )
}

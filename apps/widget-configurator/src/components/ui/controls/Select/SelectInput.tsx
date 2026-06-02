import { ReactNode } from 'react'

import CheckIcon from '@mui/icons-material/Check'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select'

import { BASE_TEXT_INPUT_HEIGHT } from '../BaseTextInput/BaseTextInput.component'

type PrimitiveValue = string | number

const DEFAULT_MENU_PAPER_SX = {
  backgroundColor: 'background.paper',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: 'none',
  backgroundImage: 'none',
  '& .MuiMenuItem-root': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root.Mui-selected.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiMenuItem-root.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected:hover, & .MuiMenuItem-root.Mui-focusVisible:hover, & .MuiMenuItem-root.Mui-selected.Mui-focusVisible:hover':
    {
      backgroundColor: 'rgba(255, 255, 255, 0.06) !important',
    },
} as const

const NO_MENU_ANIMATION_PROPS: SelectProps['MenuProps'] = {
  transitionDuration: 0,
  TransitionProps: {
    timeout: 0,
  },
  PaperProps: {
    sx: DEFAULT_MENU_PAPER_SX,
  },
}

export type SelectInputValue<TValue extends PrimitiveValue> = TValue | '' | TValue[]

export interface SelectInputOption<TValue extends PrimitiveValue = string> {
  label: string
  value: TValue
  disabled?: boolean
}

export interface SelectInputProps<TValue extends PrimitiveValue = string> {
  name: string
  label: string
  value: SelectInputValue<TValue>
  options: readonly SelectInputOption<TValue>[]
  onChange: (name: string, value: SelectInputValue<TValue>) => void
  multiple?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  displayEmpty?: boolean
  disabled?: boolean
  menuProps?: SelectProps['MenuProps']
  multilineSelectedValue?: boolean
  renderValue?: (value: SelectInputValue<TValue>) => ReactNode
  renderOptionLabel?: (option: SelectInputOption<TValue>) => ReactNode
}

function coerceSingleValue<TValue extends PrimitiveValue>(
  rawValue: string | number,
  options: readonly SelectInputOption<TValue>[],
): TValue | '' {
  const targetOption = options.find((option) => String(option.value) === String(rawValue))
  return targetOption?.value ?? ''
}

function coerceMultiValue<TValue extends PrimitiveValue>(
  rawValue: unknown,
  options: readonly SelectInputOption<TValue>[],
): TValue[] {
  if (!Array.isArray(rawValue)) return []
  return rawValue
    .map((item) => coerceSingleValue(item as string | number, options))
    .filter((item): item is TValue => item !== '')
}

// eslint-disable-next-line max-lines-per-function, complexity
export function SelectInput<TValue extends PrimitiveValue = string>({
  name,
  label,
  value,
  options,
  onChange,
  multiple = false,
  size = 'small',
  fullWidth = true,
  displayEmpty = false,
  disabled = false,
  menuProps,
  multilineSelectedValue = false,
  renderValue,
  renderOptionLabel,
}: SelectInputProps<TValue>): ReactNode {
  const resolvedId = `select-${name}`
  const resolvedLabelId = `${resolvedId}-label`

  const normalizedValue = multiple ? (Array.isArray(value) ? value : []) : (value as TValue | '')

  const handleChange = (event: SelectChangeEvent<SelectInputValue<TValue>>): void => {
    if (multiple) {
      onChange(name, coerceMultiValue(event.target.value, options))
      return
    }

    onChange(name, coerceSingleValue(event.target.value as string | number, options))
  }

  const defaultRenderValue = (selected: SelectInputValue<TValue>): ReactNode => {
    if (Array.isArray(selected)) {
      return selected
        .map(
          (selectedValue) => options.find((option) => option.value === selectedValue)?.label ?? String(selectedValue),
        )
        .join(', ')
    }

    const selectedOption = options.find((option) => option.value === selected)
    return selectedOption?.label ?? ''
  }

  const renderOptionContent = (option: SelectInputOption<TValue>, selected: boolean): ReactNode => {
    const labelContent = renderOptionLabel ? renderOptionLabel(option) : option.label
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>{labelContent}</Box>
        {multiple ? (
          <Checkbox
            checked={selected}
            sx={{ marginLeft: 'auto', padding: 0 }}
            disableRipple
            tabIndex={-1}
            inputProps={{ 'aria-hidden': true }}
          />
        ) : selected ? (
          <CheckIcon sx={{ marginLeft: 'auto' }} fontSize="small" />
        ) : (
          <Box sx={{ width: 18, marginLeft: 'auto' }} />
        )}
      </Box>
    )
  }

  const mergedMenuProps: SelectProps['MenuProps'] = {
    ...NO_MENU_ANIMATION_PROPS,
    ...menuProps,
    PaperProps: {
      ...menuProps?.PaperProps,
      sx: [
        DEFAULT_MENU_PAPER_SX,
        ...(Array.isArray(menuProps?.PaperProps?.sx)
          ? menuProps.PaperProps.sx
          : menuProps?.PaperProps?.sx
            ? [menuProps.PaperProps.sx]
            : []),
      ],
    },
  }

  return (
    <FormControl sx={{ width: fullWidth ? '100%' : undefined }}>
      <InputLabel id={resolvedLabelId} shrink={displayEmpty || multiple || undefined}>
        {label}
      </InputLabel>
      <Select
        id={resolvedId}
        labelId={resolvedLabelId}
        label={label}
        value={normalizedValue}
        onChange={handleChange}
        multiple={multiple}
        size={size}
        displayEmpty={displayEmpty}
        disabled={disabled}
        IconComponent={ExpandMoreIcon}
        MenuProps={mergedMenuProps}
        renderValue={renderValue ?? defaultRenderValue}
        sx={{
          '& .MuiInputBase-root, &.MuiInputBase-root': {
            backgroundColor: 'cyan',
          },
          '&.MuiOutlinedInput-root:not(.MuiInputBase-multiline)': multilineSelectedValue
            ? {
                minHeight: BASE_TEXT_INPUT_HEIGHT,
              }
            : {
                height: BASE_TEXT_INPUT_HEIGHT,
                minHeight: BASE_TEXT_INPUT_HEIGHT,
              },
          '& .MuiOutlinedInput-notchedOutline legend > span': {
            display: 'inline-block',
            paddingLeft: 0,
            paddingRight: 0,
          },
          ...(multilineSelectedValue
            ? {
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  whiteSpace: 'normal',
                  rowGap: 4,
                  columnGap: 4,
                },
              }
            : undefined),
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={`${name}-${String(option.value)}`}
            value={option.value}
            disabled={option.disabled}
            sx={{
              minHeight: BASE_TEXT_INPUT_HEIGHT,
              height: BASE_TEXT_INPUT_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {renderOptionContent(
              option,
              multiple ? (normalizedValue as TValue[]).includes(option.value) : normalizedValue === option.value,
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

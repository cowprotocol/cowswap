import { type ReactNode, useCallback, useMemo } from 'react'

import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent, type SelectProps } from '@mui/material/Select'
import { ChevronDown } from 'react-feather'

import {
  getSelectInputSx,
  NO_MENU_ANIMATION_PROPS,
  selectMenuItemSx,
  selectMenuPaperSx,
} from './BaseSelectInput.styles'
import { hasEmptyLabel, resolveEmptyDisplayLabel } from './BaseSelectInput.utils'

import { configuratorSurfacePaperSx } from '../../../surface/surface.styles'
import { baseTextInputFormControlSx } from '../../BaseTextInput/BaseTextInput.styles'

import type { PrimitiveValue, SelectInputOption } from './BaseSelectInput.types'

const SELECT_DROPDOWN_ICON_SIZE = 20
const SELECT_DROPDOWN_ICON_STROKE_WIDTH = 2

function SelectDropdownIcon({ className }: { className?: string }): ReactNode {
  return (
    <ChevronDown
      className={className}
      size={SELECT_DROPDOWN_ICON_SIZE}
      strokeWidth={SELECT_DROPDOWN_ICON_STROKE_WIDTH}
      aria-hidden
    />
  )
}

interface BaseSelectInputSharedProps<TValue extends PrimitiveValue> {
  name: string
  label: string
  options: readonly SelectInputOption<TValue>[]
  disabled?: boolean
  helperText?: ReactNode
  multilineSelectedValue?: boolean
  inputLabelShrink?: boolean
  menuProps?: SelectProps['MenuProps']
  renderMenuItemContent: (option: SelectInputOption<TValue>, selected: boolean) => ReactNode
}

type BaseSelectInputComponentProps<TValue extends PrimitiveValue> =
  | (BaseSelectInputSharedProps<TValue> & {
      multiple?: false
      emptyLabel?: string | boolean
      value: TValue | ''
      onChange: (name: string, value: TValue | '') => void
      renderSelectedValue: (
        selectedOption: SelectInputOption<TValue> | undefined,
        emptyDisplayLabel?: string,
      ) => ReactNode
    })
  | (BaseSelectInputSharedProps<TValue> & {
      multiple: true
      emptyLabel?: string | boolean
      value: TValue[]
      onChange: (name: string, value: TValue[]) => void
      renderSelectedValue: (selectedOptions: SelectInputOption<TValue>[], emptyDisplayLabel?: string) => ReactNode
    })

// eslint-disable-next-line max-lines-per-function
export function BaseSelectInput<TValue extends PrimitiveValue>({
  name,
  label,
  options,
  disabled = false,
  helperText,
  emptyLabel,
  multiple = false,
  multilineSelectedValue = false,
  inputLabelShrink,
  menuProps,
  value,
  onChange,
  renderSelectedValue,
  renderMenuItemContent,
}: BaseSelectInputComponentProps<TValue>): ReactNode {
  const resolvedId = `select-${name}`
  const resolvedLabelId = `${resolvedId}-label`

  const optionLookup = useMemo(() => {
    const byValue = options.reduce<Record<string, SelectInputOption<TValue>>>((acc, option) => {
      acc[String(option.value)] = option
      return acc
    }, {})

    const getOption = (rawValue: unknown): SelectInputOption<TValue> | undefined => byValue[String(rawValue)]

    const resolveSingleValue = (rawValue: unknown): TValue | '' => getOption(rawValue)?.value ?? ''

    const resolveMultiValues = (rawValue: unknown): TValue[] => {
      if (!Array.isArray(rawValue)) return []

      return rawValue.map((item) => getOption(item)?.value).filter((item): item is TValue => item !== undefined)
    }

    const resolveSelectedOptions = (selected: unknown): SelectInputOption<TValue>[] => {
      if (!Array.isArray(selected)) return []

      return selected
        .map((item) => getOption(item))
        .filter((option): option is SelectInputOption<TValue> => option !== undefined)
    }

    return {
      getOption,
      resolveSingleValue,
      resolveMultiValues,
      resolveSelectedOptions,
    }
  }, [options])

  const emptyDisplayLabel = useMemo(() => resolveEmptyDisplayLabel(emptyLabel, options), [emptyLabel, options])

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<unknown>): void => {
      if (multiple) {
        const notifyChange = onChange as (fieldName: string, fieldValue: TValue[]) => void
        notifyChange(name, optionLookup.resolveMultiValues(event.target.value))
        return
      }

      const nextValue = optionLookup.resolveSingleValue(event.target.value)

      if (hasEmptyLabel(emptyLabel)) {
        const notifyChange = onChange as (fieldName: string, fieldValue: TValue | '') => void
        notifyChange(name, nextValue)
        return
      }

      if (nextValue === '') return

      const notifyChange = onChange as (fieldName: string, fieldValue: TValue | '') => void
      notifyChange(name, nextValue)
    },
    [emptyLabel, multiple, name, onChange, optionLookup],
  )

  const mergedMenuProps: SelectProps['MenuProps'] = {
    ...NO_MENU_ANIMATION_PROPS,
    ...menuProps,
    PaperProps: {
      ...menuProps?.PaperProps,
      sx: [
        configuratorSurfacePaperSx,
        selectMenuPaperSx,
        ...(Array.isArray(menuProps?.PaperProps?.sx)
          ? menuProps.PaperProps.sx
          : menuProps?.PaperProps?.sx
            ? [menuProps.PaperProps.sx]
            : []),
      ],
    },
  }

  const isOptionSelected = (option: SelectInputOption<TValue>): boolean => {
    if (multiple) {
      return Array.isArray(value) && value.includes(option.value)
    }

    return value === option.value
  }

  const muiRenderValue: SelectProps['renderValue'] = (selected) => {
    if (multiple) {
      const selectedOptions = optionLookup.resolveSelectedOptions(selected)

      return (
        renderSelectedValue as (selectedOptions: SelectInputOption<TValue>[], emptyDisplayLabel?: string) => ReactNode
      )(selectedOptions, emptyDisplayLabel)
    }

    return (
      renderSelectedValue as (
        selectedOption: SelectInputOption<TValue> | undefined,
        emptyDisplayLabel?: string,
      ) => ReactNode
    )(optionLookup.getOption(selected), emptyDisplayLabel)
  }

  return (
    <FormControl sx={baseTextInputFormControlSx} margin="dense">
      <InputLabel id={resolvedLabelId} shrink={inputLabelShrink}>
        {label}
      </InputLabel>
      <Select
        id={resolvedId}
        labelId={resolvedLabelId}
        label={label}
        value={value}
        onChange={handleSelectChange}
        multiple={multiple}
        size="small"
        displayEmpty={hasEmptyLabel(emptyLabel)}
        disabled={disabled}
        notched={inputLabelShrink === true ? true : undefined}
        IconComponent={SelectDropdownIcon}
        MenuProps={mergedMenuProps}
        renderValue={muiRenderValue}
        sx={getSelectInputSx(multilineSelectedValue)}
      >
        {options.map((option) => (
          <MenuItem
            key={`${name}-${String(option.value)}`}
            value={option.value}
            disabled={option.disabled}
            sx={selectMenuItemSx}
          >
            {renderMenuItemContent(option, isOptionSelected(option))}
          </MenuItem>
        ))}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}

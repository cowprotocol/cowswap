import { type ComponentType, type ReactNode } from 'react'

import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { SelectInput, type SelectInputOption } from '../ui/controls/Select/SelectInput'

export type ThemeOptionValue = 'light' | 'dark'

interface ThemeOption {
  icon: ComponentType
  label: string
  value: ThemeOptionValue
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { label: 'Light', value: 'light', icon: LightModeIcon },
  { label: 'Dark', value: 'dark', icon: DarkModeIcon },
]

function getThemeOption(value: ThemeOptionValue): ThemeOption {
  const selectedOption = THEME_OPTIONS.find((option) => option.value === value)

  if (!selectedOption) {
    throw new Error(`Unsupported theme option: ${value}`)
  }

  return selectedOption
}

function ThemeOptionContent({ icon: Icon, label }: Pick<ThemeOption, 'icon' | 'label'>): ReactNode {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon />
      <Typography component="span" sx={{ fontSize: '1.4rem' }}>
        {label}
      </Typography>
    </Box>
  )
}

export interface ThemeControlProps {
  /** Current select value: `auto` or an explicit palette mode. */
  name: string
  selectedValue: ThemeOptionValue
  onChange: (name: string, value: ThemeOptionValue) => void
}

export function ThemeControl({ name, selectedValue, onChange }: ThemeControlProps): ReactNode {
  return (
    <SelectInput
      labelId="select-theme-label"
      id="select-theme"
      name={name}
      value={selectedValue}
      label="Theme"
      options={THEME_OPTIONS.map<SelectInputOption<ThemeOptionValue>>((option) => ({
        label: option.label,
        value: option.value,
      }))}
      onChange={(_, value) => {
        if (value === '' || Array.isArray(value)) return
        onChange(name, value as ThemeOptionValue)
      }}
      renderOptionLabel={(option) => {
        const themeOption = getThemeOption(option.value as ThemeOptionValue)
        return <ThemeOptionContent icon={themeOption.icon} label={themeOption.label} />
      }}
      renderValue={(value) => {
        if (value === '' || Array.isArray(value)) return null
        const selectedOption = getThemeOption(value as ThemeOptionValue)

        return <ThemeOptionContent icon={selectedOption.icon} label={selectedOption.label} />
      }}
    />
  )
}

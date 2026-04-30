import { type ComponentType, type ReactNode } from 'react'

import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'

export const THEME_OPTION_AUTO = 'auto' as const

export type ThemeOptionValue = typeof THEME_OPTION_AUTO | 'light' | 'dark'

interface ThemeOption {
  icon: ComponentType
  label: string
  value: ThemeOptionValue
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { label: 'Auto', value: THEME_OPTION_AUTO, icon: SettingsBrightnessIcon },
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
  selectedValue: ThemeOptionValue
  onChange: (value: ThemeOptionValue) => void
}

export function ThemeControl({ selectedValue, onChange }: ThemeControlProps): ReactNode {
  const handleThemeChange = (event: SelectChangeEvent<ThemeOptionValue>): void => {
    onChange(event.target.value as ThemeOptionValue)
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id="select-theme-label">Theme</InputLabel>
      <Select
        labelId="select-theme-label"
        id="select-theme"
        value={selectedValue}
        onChange={handleThemeChange}
        label="Theme"
        size="small"
        renderValue={(value) => {
          const selectedOption = getThemeOption(value as ThemeOptionValue)

          return <ThemeOptionContent icon={selectedOption.icon} label={selectedOption.label} />
        }}
      >
        {THEME_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <ThemeOptionContent icon={option.icon} label={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

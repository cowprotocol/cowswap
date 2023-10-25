import { useContext } from 'react'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import { ColorModeContext } from '../../../theme/ColorModeContext'

const ThemeOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

export function ThemeControl() {
  const { mode, toggleColorMode, setAutoMode } = useContext(ColorModeContext)

  const handleThemeChange = (event: SelectChangeEvent) => {
    const selectedTheme = event.target.value
    if (selectedTheme === 'auto') {
      setAutoMode()
    } else {
      toggleColorMode()
    }
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id="select-theme">Theme</InputLabel>
      <Select
        labelId="select-theme-label"
        id="select-theme"
        value={mode}
        onChange={handleThemeChange}
        autoWidth
        label="Theme"
        size="small"
      >
        {ThemeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

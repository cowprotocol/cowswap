import { useContext, useState } from 'react'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import { ColorModeContext } from '../../../theme/ColorModeContext'

const AUTO = 'auto'

const ThemeOptions = [
  { label: 'Auto', value: AUTO },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ThemeControl() {
  const { mode, toggleColorMode, setAutoMode } = useContext(ColorModeContext)
  const [isAutoMode, setIsAutoMode] = useState(false)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleThemeChange = (event: SelectChangeEvent) => {
    const selectedTheme = event.target.value
    if (selectedTheme === AUTO) {
      setAutoMode()
      setIsAutoMode(true)
    } else {
      toggleColorMode()
      setIsAutoMode(false)
    }
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id="select-theme">Theme</InputLabel>
      <Select
        labelId="select-theme-label"
        id="select-theme"
        value={isAutoMode ? AUTO : mode}
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

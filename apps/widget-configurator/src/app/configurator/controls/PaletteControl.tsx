import { useState, useEffect, useContext, useMemo } from 'react'

import { FormControl, Button, Collapse } from '@mui/material'
import { debounce } from 'lodash' // Assuming lodash is installed
import { MuiColorInput } from 'mui-color-input'

import { ColorModeContext } from '../../../theme/ColorModeContext'

const LOCAL_STORAGE_KEY_NAME = 'cow_widget_palette_'
const DEBOUNCE_TIME = 1000

type ColorKeys = 'primary' | 'secondary' | 'background' | 'paper' | 'text' | 'error' | 'warning' | 'info' | 'success'

type ColorPalette = {
  [key in ColorKeys]: string
}

type ColorPaletteKey = keyof ColorPalette

const getPaletteFromLocalStorage = (mode: string, defaultPalette: ColorPalette) => {
  try {
    const savedColors = localStorage.getItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)
    return savedColors ? JSON.parse(savedColors) : defaultPalette
  } catch (error) {
    console.error('Error reading from localStorage', error)
    return defaultPalette
  }
}

export function PaletteControl() {
  const { mode } = useContext(ColorModeContext)

  const defaultLightPalette = useMemo(
    () => ({
      primary: '#3f51b5',
      secondary: '#f50057',
      background: '#ffffff',
      paper: '#f5f5f5',
      text: '#000000',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50',
    }),
    []
  )

  const defaultDarkPalette = useMemo(
    () => ({
      primary: '#3f51b5',
      secondary: '#f50057',
      background: '#303030',
      paper: '#424242',
      text: '#ffffff',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50',
    }),
    []
  )

  const [lightColors, setLightColors] = useState<ColorPalette>(() =>
    getPaletteFromLocalStorage('light', defaultLightPalette)
  )
  const [darkColors, setDarkColors] = useState<ColorPalette>(() =>
    getPaletteFromLocalStorage('dark', defaultDarkPalette)
  )

  const colors = mode === 'dark' ? darkColors : lightColors
  const setColors = mode === 'dark' ? setDarkColors : setLightColors

  useEffect(() => {
    const savedColors = getPaletteFromLocalStorage(mode, mode === 'dark' ? defaultDarkPalette : defaultLightPalette)
    setColors(savedColors)
  }, [mode, defaultDarkPalette, defaultLightPalette, setColors])

  const debouncedUpdateLocalStorage = useMemo(
    () =>
      debounce((newColors: ColorPalette, mode: string) => {
        const defaultPalette = mode === 'dark' ? defaultDarkPalette : defaultLightPalette
        const changedColors = Object.keys(newColors).reduce((acc, key) => {
          const colorKey = key as ColorPaletteKey
          if (newColors[colorKey] !== defaultPalette[colorKey]) {
            acc[colorKey] = newColors[colorKey]
          }
          return acc
        }, {} as ColorPalette)

        if (Object.keys(changedColors).length > 0) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`, JSON.stringify(changedColors))
        } else {
          localStorage.removeItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)
        }
      }, DEBOUNCE_TIME),
    [defaultDarkPalette, defaultLightPalette]
  )

  const handleColorChange = (color: ColorKeys) => (newValue: string) => {
    const newColors = { ...colors, [color]: newValue }
    setColors(newColors)
    debouncedUpdateLocalStorage(newColors, mode)
  }

  const handleReset = () => {
    debouncedUpdateLocalStorage.cancel()
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)
    const defaultPalette = mode === 'dark' ? defaultDarkPalette : defaultLightPalette
    setColors(defaultPalette)
  }

  const renderColorInput = (color: ColorKeys) => (
    <MuiColorInput
      value={colors[color] || defaultLightPalette[color]}
      onChange={handleColorChange(color)}
      size="small"
      variant="outlined"
      label={`${color.charAt(0).toUpperCase() + color.slice(1)}`}
      fallbackValue={defaultLightPalette[color]}
      format="hex"
      isAlphaHidden
    />
  )

  const [expanded, setExpanded] = useState(false)

  return (
    <FormControl sx={{ width: '100%', gap: '1.6rem' }}>
      {renderColorInput('primary')}
      {renderColorInput('secondary')}

      <Collapse in={expanded}>
        <FormControl sx={{ width: '100%', gap: '1.6rem' }}>
          {(['background', 'paper', 'text', 'error', 'warning', 'info', 'success'] as ColorKeys[]).map((color) =>
            renderColorInput(color)
          )}
        </FormControl>
      </Collapse>

      <Button onClick={() => setExpanded(!expanded)}>{expanded ? 'Less' : 'More'} Options</Button>
      <Button onClick={handleReset}>Reset to Default</Button>
    </FormControl>
  )
}

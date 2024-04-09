import { useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

import { ColorModeParams } from '../ColorModeContext'

const THEME_STORAGE_KEY = 'widget-cfg-theme'

const getThemeFromCache = () => localStorage.getItem(THEME_STORAGE_KEY) as PaletteMode

export function useColorMode(): ColorModeParams {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(getThemeFromCache() || (prefersDarkMode ? 'dark' : 'light'))

  const updateMode = (mode: PaletteMode) => {
    setMode(mode)
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }

  return useMemo(
    () => ({
      mode,
      setMode: (mode: PaletteMode) => {
        updateMode(mode)
      },
      toggleColorMode: () => {
        updateMode(mode === 'light' ? 'dark' : 'light')
      },
      setAutoMode: () => {
        updateMode(prefersDarkMode ? 'dark' : 'light')
      },
    }),
    [mode, prefersDarkMode]
  )
}

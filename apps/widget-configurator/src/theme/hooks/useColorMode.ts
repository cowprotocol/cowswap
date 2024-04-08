import { useEffect, useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

import { ColorModeParams } from '../ColorModeContext'

const THEME_STORAGE_KEY = 'widget-cfg-theme'

const getThemeFromCache = () => localStorage.getItem(THEME_STORAGE_KEY)

export function useColorMode(): ColorModeParams {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(getThemeFromCache() || prefersDarkMode ? 'dark' : 'light')

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  return useMemo(
    () => ({
      mode,
      setMode: (mode: PaletteMode) => {
        setMode(mode)
      },
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
      setAutoMode: () => {
        setMode(prefersDarkMode ? 'dark' : 'light')
      },
    }),
    [mode, prefersDarkMode]
  )
}

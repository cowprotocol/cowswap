import { useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

import { ColorModeParams } from '../ColorModeContext'

export function useColorMode(): ColorModeParams {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light')

  const updateMode = (mode: PaletteMode) => {
    setMode(mode)
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
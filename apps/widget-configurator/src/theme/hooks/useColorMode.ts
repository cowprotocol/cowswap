import { useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

import { ColorModeParams } from '../ColorModeContext'

export function useColorMode(): ColorModeParams {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light')

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

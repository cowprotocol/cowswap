import { useMemo, useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { PaletteMode } from '@mui/material'

interface ColorModeParams {
  mode: PaletteMode
  toggleColorMode(): void
  setAutoMode(): void
}

export function useColorMode(): ColorModeParams {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light')

  return useMemo(
    () => ({
      mode,
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

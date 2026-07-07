import { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo } from 'react'

import { useLocalStorageState } from '@cowprotocol/common-hooks'

import { PaletteMode } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useAppKitTheme } from '@reown/appkit/react'

import { ColorModeContext } from './ColorModeContext'

import { CONFIGURATOR_THEME_STORAGE_KEY } from '../../configurator.constants'

function isPaletteMode(value: unknown): value is PaletteMode {
  return value === 'light' || value === 'dark'
}

export function ColorModeProvider({ children }: PropsWithChildren): ReactNode {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useLocalStorageState<PaletteMode>(CONFIGURATOR_THEME_STORAGE_KEY, (persistedValue) =>
    isPaletteMode(persistedValue) ? persistedValue : prefersDarkMode ? 'dark' : 'light',
  )
  const { setThemeMode } = useAppKitTheme()

  useEffect(() => {
    setThemeMode(mode)
  }, [mode, setThemeMode])

  const toggleColorMode = useCallback(() => {
    setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'))
  }, [setMode])

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode, toggleColorMode],
  )

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}

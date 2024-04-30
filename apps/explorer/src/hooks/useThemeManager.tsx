import { useCallback, useMemo } from 'react'

import { ThemeState, updateTheme } from 'state/theme'
import { Theme } from 'theme'

import useGlobalState from './useGlobalState'


export function useThemeMode<State extends { theme: ThemeState }>(): Theme {
  const [state] = useGlobalState<State>()

  return useMemo(() => state.theme || Theme.DARK, [state.theme])
}

export function useThemeManager<State extends { theme: ThemeState }>(): [Theme, (newTheme: Theme) => void] {
  const [, dispatch] = useGlobalState<State>()
  const theme = useThemeMode<State>()

  const setNewTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(updateTheme(newTheme))
    },
    [dispatch],
  )

  return [theme, setNewTheme]
}

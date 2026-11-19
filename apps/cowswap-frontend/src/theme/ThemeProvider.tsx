import { useStore } from 'jotai'
import { ReactNode, useLayoutEffect, useState } from 'react'

import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { themeConfigAtom } from './themeConfigAtom'
import { ThemedGlobalStyle } from './ThemedGlobalStyle'

export function ThemeProvider({ children }: { children?: ReactNode }): ReactNode {
  const themeConfig = useThemeConfig()

  return (
    <>
      <StyledComponentsThemeProvider theme={themeConfig}>
        <ThemedGlobalStyle />
        {children}
      </StyledComponentsThemeProvider>
    </>
  )
}

/**
 * Subscribes before paint, where `useAtomValue` subscribes after it. A theme set while the app
 * commits, such as a custom palette, is then painted in that same frame instead of one frame late.
 */
function useThemeConfig(): DefaultTheme {
  const store = useStore()
  const [themeConfig, setThemeConfig] = useState(() => store.get(themeConfigAtom))

  useLayoutEffect(() => {
    const sync = (): void => setThemeConfig(store.get(themeConfigAtom))

    sync()

    return store.sub(themeConfigAtom, sync)
  }, [store])

  return themeConfig
}

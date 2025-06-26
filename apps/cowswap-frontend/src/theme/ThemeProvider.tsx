import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { themeConfigAtom } from './themeConfigAtom'
import { ThemedGlobalStyle } from './ThemedGlobalStyle'

export function ThemeProvider({ children }: { children?: ReactNode }): ReactNode {
  const themeConfig = useAtomValue(themeConfigAtom)

  return (
    <>
      <StyledComponentsThemeProvider theme={themeConfig}>
        <ThemedGlobalStyle />
        {children}
      </StyledComponentsThemeProvider>
    </>
  )
}

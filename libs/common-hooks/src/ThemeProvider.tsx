'use client'

import { type PropsWithChildren } from 'react'

import { ThemeProvider as StyledThemeProvider } from 'styled-components/macro'

import { ThemeContext } from './useTheme'

import type { Theme } from './theme'

interface ThemeProviderProps extends PropsWithChildren {
  theme: Theme
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  )
}

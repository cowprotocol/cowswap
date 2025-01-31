'use client'

import { type PropsWithChildren } from 'react'

import { ThemeProvider as StyledThemeProvider } from 'styled-components/macro'

import type { DefaultTheme } from 'styled-components/macro'

interface ThemeProviderProps extends PropsWithChildren {
  theme: DefaultTheme
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
}

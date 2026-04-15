'use client'

import { PropsWithChildren, useMemo } from 'react'

import { baseTheme } from '@cowprotocol/ui'

import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { THEME_MODE } from '@/components/Layout/const'

function getCowfiTheme() {
  return baseTheme(THEME_MODE)
}

export function ThemeProvider(props: PropsWithChildren) {
  const theme = useMemo(() => getCowfiTheme(), [])

  return <StyledComponentsThemeProvider theme={theme}>{props.children}</StyledComponentsThemeProvider>
}

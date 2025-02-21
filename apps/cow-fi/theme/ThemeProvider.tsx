'use client'

import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { baseTheme } from '@cowprotocol/ui'
import { THEME_MODE } from '@/components/Layout/const'
import { PropsWithChildren, useMemo } from 'react'

function getCowfiTheme() {
  return baseTheme(THEME_MODE)
}

export function ThemeProvider(props: PropsWithChildren) {
  const theme = useMemo(() => getCowfiTheme(), [])

  return <StyledComponentsThemeProvider theme={theme}>{props.children}</StyledComponentsThemeProvider>
}

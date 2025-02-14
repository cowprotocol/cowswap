import React, { PropsWithChildren } from 'react'

import { baseTheme } from '@cowprotocol/ui'

import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getFonts } from './styles'
import { Theme } from './types'

const themeObject = {
  ...baseTheme(Theme.DARK),
  mode: Theme.DARK,
  ...getFonts(),
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

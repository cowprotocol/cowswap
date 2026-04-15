import React, { PropsWithChildren } from 'react'

import { baseTheme } from '@cowprotocol/ui'

import { css, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getFonts } from './styles'
import { Theme } from './types'

const themeObject = {
  ...baseTheme(Theme.DARK),
  mode: Theme.DARK,
  ...getFonts(),
  colorScrollbar: css`
    --scrollbarWidth: 0.6rem;

    &::-webkit-scrollbar {
      width: var(--scrollbarWidth);
      height: var(--scrollbarWidth);
    }
    &::-webkit-scrollbar-thumb {
      background: hsla(0, 0%, 100%, 0.35);
      border-radius: 2rem;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
  `,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheet, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getCowswapTheme } from './getCowswapTheme'
import { ThemedGlobalStyle } from './ThemedGlobalStyle'

describe('ThemedGlobalStyle', () => {
  it('resets inherited Inter font features at the body boundary', () => {
    const sheet = new ServerStyleSheet()

    try {
      renderToStaticMarkup(
        sheet.collectStyles(
          <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
            <ThemedGlobalStyle />
          </StyledComponentsThemeProvider>,
        ),
      )

      expect(sheet.getStyleTags()).toMatch(/body\s*\{[^}]*font-feature-settings:\s*'liga'\s+off,\s*'kern'\s+on\s*;/)
    } finally {
      sheet.seal()
    }
  })
})

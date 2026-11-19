import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheet, ThemeProvider as StyledComponentsThemeProvider, useTheme } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'
import { VICE_THEME, VICE_THEME_PALETTE } from 'theme/viceTheme.constants'

import { CustomThemeProvider } from './CustomThemeProvider.container'

import { useAppTheme } from '../../hooks/useAppTheme'

jest.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}))

const mockedUseAppTheme = useAppTheme as jest.MockedFunction<typeof useAppTheme>
const baseTheme = getCowswapTheme(true)

function CurrentPrimary(): ReactNode {
  return <span data-testid="primary">{useTheme().primary}</span>
}

function overridingPrimaryVariables(): string[] {
  const sheet = new ServerStyleSheet()

  try {
    renderToStaticMarkup(
      sheet.collectStyles(
        <StyledComponentsThemeProvider theme={baseTheme}>
          <CustomThemeProvider>
            <CurrentPrimary />
          </CustomThemeProvider>
        </StyledComponentsThemeProvider>,
      ),
    )

    const overrides = sheet.getStyleTags().matchAll(/:root:root\s*\{[^}]*--cow-color-primary:\s*([^;]+);/g)

    return Array.from(overrides).map(([, value]) => value)
  } finally {
    sheet.seal()
  }
}

function renderProvider(): void {
  render(
    <StyledComponentsThemeProvider theme={baseTheme}>
      <CustomThemeProvider>
        <CurrentPrimary />
      </CustomThemeProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('CustomThemeProvider', () => {
  it('passes the app theme through when no custom theme is active', () => {
    mockedUseAppTheme.mockReturnValue(undefined)

    renderProvider()

    expect(screen.getByTestId('primary').textContent).toBe(baseTheme.primary)
    expect(overridingPrimaryVariables()).toEqual([])
  })

  it('lays the Vice palette over the app theme in the same render', () => {
    mockedUseAppTheme.mockReturnValue(VICE_THEME)

    renderProvider()

    expect(screen.getByTestId('primary').textContent).toBe(VICE_THEME_PALETTE.primary)
  })

  it('names the custom theme on the theme it provides', () => {
    mockedUseAppTheme.mockReturnValue(VICE_THEME)

    function CurrentCustomTheme(): ReactNode {
      return <span data-testid="custom-theme">{useTheme().customTheme}</span>
    }

    render(
      <StyledComponentsThemeProvider theme={baseTheme}>
        <CustomThemeProvider>
          <CurrentCustomTheme />
        </CustomThemeProvider>
      </StyledComponentsThemeProvider>,
    )

    expect(screen.getByTestId('custom-theme').textContent).toBe(VICE_THEME)
  })

  it('declares the Vice colour variables under a selector that outranks the root ones', () => {
    mockedUseAppTheme.mockReturnValue(VICE_THEME)

    expect(overridingPrimaryVariables()).toEqual([VICE_THEME_PALETTE.primary])
  })

  it('leaves the palette to themes that have one', () => {
    mockedUseAppTheme.mockReturnValue('darkHalloween')

    renderProvider()

    expect(screen.getByTestId('primary').textContent).toBe(baseTheme.primary)
    expect(overridingPrimaryVariables()).toEqual([])
  })
})

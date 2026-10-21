import { ReactElement } from 'react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { ConfirmationSuccessHeading } from './ConfirmationSuccessHeading.pure'

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() =>
      ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }) as unknown as MediaQueryList)
})

function getInjectedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('\n')
}

function renderHeading(element: ReactElement): RenderResult {
  return render(<StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{element}</StyledComponentsThemeProvider>)
}

describe('ConfirmationSuccessHeading', () => {
  it('renders the title and subtitle', () => {
    renderHeading(<ConfirmationSuccessHeading title="Swap complete" subtitle="Your COW is in your wallet." />)

    const heading = screen.getByTestId('confirmation-success-heading')
    expect(heading.textContent).toContain('Swap complete')
    expect(heading.textContent).toContain('Your COW is in your wallet.')
  })

  it('animates the success gradient and check blur, and skips both when motion is reduced', () => {
    renderHeading(<ConfirmationSuccessHeading title="Your TWAP is active" />)

    const cssText = getInjectedCss().replace(/\s/g, '')

    expect(cssText).toContain('filter:blur(8px)')
    expect(cssText).toContain('filter:blur(0)')
    expect(cssText).toContain('@media(prefers-reduced-motion:reduce)')
    expect(cssText).toMatch(/@media\(prefers-reduced-motion:reduce\)\{[^}]*animation:none/)
  })
})

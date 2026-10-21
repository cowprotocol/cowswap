import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { WAIT_AND_SAVE_OUTCOME_DEMO } from './waitAndSaveOutcome.demo'
import { WaitAndSaveOutcome } from './WaitAndSaveOutcome.pure'

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => <svg data-testid="inline-svg" />,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

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

function renderOutcome(element: ReactElement): RenderResult {
  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>{element}</I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('WaitAndSaveOutcome', () => {
  it('renders gain copy and truncates long symbols', () => {
    renderOutcome(
      <WaitAndSaveOutcome {...WAIT_AND_SAVE_OUTCOME_DEMO} tokenSymbol="SUPERLONGTOKENXYZ" gainPercent={0.004} />,
    )

    expect(screen.getByTestId('wait-and-save-outcome').textContent).toContain('SUPERLONGTOK...')
    expect(screen.getByTitle('SUPERLONGTOKENXYZ').textContent).toBe('SUPERLONGTOK...')
    expect(screen.getByTestId('wait-and-save-gain-pill').textContent).toBe('<0.01%')
  })
})

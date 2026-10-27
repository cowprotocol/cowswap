import { ReactElement, ReactNode } from 'react'

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

jest.mock('@cowprotocol/ui', () => {
  const actual = jest.requireActual('@cowprotocol/ui')

  return {
    ...actual,
    TooltipIcon: ({ content }: { content: ReactNode }) => <span data-testid="tooltip-icon">{content}</span>,
  }
})

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

  it('explains trading alone as the best same-auction single-order offer', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_OUTCOME_DEMO} />)

    expect(screen.getByTestId('tooltip-icon').textContent).toBe(
      "Compares what you received with the best offer solvers made for your order alone, in the same auction. It's not compared with swapping right away or with your quote.",
    )
  })

  it('skips the hero blur transition when the user prefers reduced motion', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_OUTCOME_DEMO} />)

    const cssText = Array.from(document.querySelectorAll('style'))
      .map((node) => node.textContent ?? '')
      .join('\n')
      .replace(/\s/g, '')

    expect(cssText).toContain('@media(prefers-reduced-motion:reduce)')
    expect(cssText).toContain('filter:none')
    expect(cssText).toContain('transition:none')
  })
})

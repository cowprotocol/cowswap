import { ReactElement, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import {
  WAIT_AND_SAVE_WITH_COW_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_FIAT_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_DEMO,
} from './waitAndSaveOutcome.demo'
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
  it('renders the large comparison card and truncates long symbols', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_WITH_COW_DEMO} tokenSymbol="SUPERLONGTOKENXYZ" />)

    expect(screen.getByTestId('wait-and-save-outcome').textContent).toContain('SUPERLONGTOK...')
    expect(screen.getByTitle('SUPERLONGTOKENXYZ').textContent).toBe('SUPERLONGTOK...')
    expect(screen.getByTestId('wait-and-save-outcome').textContent).toContain('Better price than trading alone')
  })

  it('renders the comparison card with a savings breakdown when fee waiver and comparison are both available', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_FIAT_DEMO} />)

    const text = screen.getByTestId('wait-and-save-outcome').textContent
    expect(text).toContain('Wait & save · You saved')
    expect(text).toContain('$4.80')
    expect(text).toContain('Better price than trading alone')
    expect(text).toContain('+$4.50')
    expect(text).toContain('No volume fee')
    expect(text).toContain('+$0.30')
  })

  it('renders the compact fee-waiver banner when comparison is unavailable', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_WITH_WAIVED_FEE_DEMO} />)

    expect(screen.getByTestId('wait-and-save-outcome').textContent).toContain(
      'Wait & save: $0.30 saved on the volume fee',
    )
  })

  it('explains trading alone as the best same-auction single-order offer', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_WITH_COW_DEMO} />)

    expect(screen.getByTestId('tooltip-icon').textContent).toBe(
      "Compares what you received with the best offer solvers made for your order alone, in the same auction. It's not compared with swapping right away or with your quote.",
    )
  })

  it('skips the hero blur transition when the user prefers reduced motion', () => {
    renderOutcome(<WaitAndSaveOutcome {...WAIT_AND_SAVE_WITH_COW_DEMO} />)

    const cssText = Array.from(document.querySelectorAll('style'))
      .map((node) => node.textContent ?? '')
      .join('\n')
      .replace(/\s/g, '')

    expect(cssText).toContain('@media(prefers-reduced-motion:reduce)')
    expect(cssText).toContain('filter:none')
    expect(cssText).toContain('transition:none')
  })
})

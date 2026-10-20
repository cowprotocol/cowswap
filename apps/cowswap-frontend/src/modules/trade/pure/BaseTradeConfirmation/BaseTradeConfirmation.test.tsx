import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { BaseTradeConfirmation } from './BaseTradeConfirmation.pure'

jest.mock('../TradeTokenPair/TradeTokenPair.pure', () => ({
  TradeTokenPair: () => <div data-testid="trade-token-pair" />,
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

function renderConfirmation(element: ReactElement): RenderResult {
  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>{element}</I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

const tokenPair = {
  variant: 'slim' as const,
  inputCurrencyInfo: {
    amount: null,
    fiatAmount: null,
    balance: null,
    label: 'You sold',
  },
  outputCurrencyInfo: {
    amount: null,
    fiatAmount: null,
    balance: null,
    label: 'You received',
  },
  priceImpact: { priceImpact: undefined, loading: false },
}

describe('BaseTradeConfirmation', () => {
  it('renders the success heading, token pair, and children slot', () => {
    renderConfirmation(
      <BaseTradeConfirmation heading={{ title: 'Swap complete', subtitle: 'View on Explorer' }} tokenPair={tokenPair}>
        <div data-testid="confirmation-children">Child body</div>
      </BaseTradeConfirmation>,
    )

    expect(screen.getByTestId('confirmation-success-heading').textContent).toContain('Swap complete')
    expect(screen.getByTestId('trade-token-pair')).toBeTruthy()
    expect(screen.getByTestId('confirmation-children').textContent).toBe('Child body')
  })

  it('renders heading only when token pair is omitted', () => {
    renderConfirmation(<BaseTradeConfirmation heading={{ title: 'Your TWAP is active' }} />)

    expect(screen.getByTestId('confirmation-success-heading').textContent).toContain('Your TWAP is active')
    expect(screen.queryByTestId('trade-token-pair')).toBeNull()
  })

  it('renders body without heading when heading is omitted', () => {
    renderConfirmation(
      <BaseTradeConfirmation tokenPair={tokenPair}>
        <div data-testid="confirmation-children">Child body</div>
      </BaseTradeConfirmation>,
    )

    expect(screen.queryByTestId('confirmation-success-heading')).toBeNull()
    expect(screen.getByTestId('trade-token-pair')).toBeTruthy()
    expect(screen.getByTestId('confirmation-children').textContent).toBe('Child body')
  })
})

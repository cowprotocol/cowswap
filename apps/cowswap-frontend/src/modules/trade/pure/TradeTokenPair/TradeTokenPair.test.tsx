import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { TradeTokenPair } from './TradeTokenPair.pure'

jest.mock('common/pure/CurrencyAmountPreview', () => ({
  CurrencyAmountPreview: ({ id }: { id: string }) => <div data-testid={id} />,
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

function renderPair(element: ReactElement): RenderResult {
  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>{element}</I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

const tokenPairProps = {
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

describe('TradeTokenPair', () => {
  it('does not render a footer by default', () => {
    renderPair(<TradeTokenPair {...tokenPairProps} />)

    expect(screen.queryByTestId('trade-token-pair-footer')).toBeNull()
  })

  it('renders a footer when the caller provides one', () => {
    renderPair(<TradeTokenPair {...tokenPairProps} footer={<span>Custom footer</span>} />)

    expect(screen.getByTestId('trade-token-pair-footer').textContent).toContain('Custom footer')
  })
})

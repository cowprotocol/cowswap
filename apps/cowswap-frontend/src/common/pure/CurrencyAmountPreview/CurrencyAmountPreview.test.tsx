import { ReactElement, ReactNode } from 'react'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { CurrencyAmountPreview } from './index'

jest.mock('@cowprotocol/tokens', () => ({
  TokenLogo: () => <span data-testid="token-logo" />,
}))

jest.mock('@cowprotocol/ui', () => {
  const actual = jest.requireActual('@cowprotocol/ui')

  return {
    ...actual,
    TokenAmount: ({ prefix }: { prefix?: ReactNode }) => <span data-testid="token-amount">{prefix}amount</span>,
    FiatAmount: ({ withParentheses }: { withParentheses?: boolean }) => (
      <span className="fiat-amount">{withParentheses ? '(≈ $7.61)' : '$7.61'}</span>
    ),
    InfoTooltip: ({ content }: { content: ReactNode }) => <span data-testid="info-tooltip">{content}</span>,
  }
})

function renderPreview(element: ReactElement): RenderResult {
  return render(<StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{element}</StyledComponentsThemeProvider>)
}

const surplusAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, '2470000')
const surplusFiat = CurrencyAmount.fromRawAmount(USDC_MAINNET, '7610000')

describe('CurrencyAmountPreview', () => {
  it('renders a surplus secondary amount with fiat and tooltip', () => {
    renderPreview(
      <CurrencyAmountPreview
        variant="slim"
        id="output-currency-preview"
        currencyInfo={{
          amount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '487180000'),
          fiatAmount: null,
          balance: null,
          label: 'You received',
          secondaryAmount: {
            amount: surplusAmount,
            fiatAmount: surplusFiat,
            prefix: '+',
            tooltip: 'Surplus tooltip',
            variant: 'success',
          },
        }}
      />,
    )

    const secondary = screen.getByTestId('currency-preview-secondary-amount')
    expect(secondary.textContent).toContain('+')
    expect(secondary.textContent).toContain('(≈ $7.61)')
    expect(screen.getByTestId('info-tooltip').textContent).toBe('Surplus tooltip')
  })
})

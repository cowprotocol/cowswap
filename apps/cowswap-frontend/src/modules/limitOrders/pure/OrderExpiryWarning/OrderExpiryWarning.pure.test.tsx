import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { OrderExpiryWarning } from './OrderExpiryWarning.pure'

import { OrderExpiryWarningTier } from '../../utils/getOrderExpiryWarningTier.utils'

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

const inputCurrency = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]

function renderWarning(
  tier: OrderExpiryWarningTier,
  onAcknowledgeChange: (checked: boolean) => void = jest.fn(),
  isAccepted = false,
): void {
  render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <OrderExpiryWarning
          tier={tier}
          inputCurrency={inputCurrency}
          isAccepted={isAccepted}
          onAcknowledgeChange={onAcknowledgeChange}
        />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('OrderExpiryWarning', () => {
  it('renders nothing for short-lived orders', () => {
    renderWarning(OrderExpiryWarningTier.None)

    expect(screen.queryByTestId('order-expiry-warning-subtle')).toBeNull()
    expect(screen.queryByTestId('order-expiry-warning-prominent')).toBeNull()
  })

  it('renders an informational note without a checkbox for the subtle tier', () => {
    renderWarning(OrderExpiryWarningTier.Subtle)

    expect(screen.getByTestId('order-expiry-warning-subtle')).toBeTruthy()
    expect(screen.queryByTestId('order-expiry-warning-checkbox')).toBeNull()
  })

  it('renders an acknowledgement checkbox for the prominent tier', () => {
    const onAcknowledgeChange = jest.fn()

    renderWarning(OrderExpiryWarningTier.Prominent, onAcknowledgeChange)

    expect(screen.getByTestId('order-expiry-warning-prominent')).toBeTruthy()

    fireEvent.click(screen.getByTestId('order-expiry-warning-checkbox'))

    expect(onAcknowledgeChange).toHaveBeenCalledWith(true)
  })

  it('reports unchecking an accepted warning', () => {
    const onAcknowledgeChange = jest.fn()

    renderWarning(OrderExpiryWarningTier.Prominent, onAcknowledgeChange, true)

    fireEvent.click(screen.getByTestId('order-expiry-warning-checkbox'))

    expect(onAcknowledgeChange).toHaveBeenCalledWith(false)
  })
})

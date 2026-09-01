import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { PrintedOrderReceipt } from './PrintedOrderReceipt.pure'

import { getOrderMock } from '../../../../mocks/orderMock'

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})
jest.mock('./assets/cowswap-thermal-wordmark.png', () => '/cowswap-thermal-wordmark.png')
jest.mock('./assets/cowswap-thermal-hero.png', () => '/cowswap-thermal-hero.png')

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  status: OrderStatus.FULFILLED,
  creationTime: '2026-08-19T12:59:50.000Z',
  fulfillmentTime: '2026-08-19T13:00:00.000Z',
  apiAdditionalInfo: {
    executedBuyAmount: '1000000',
    executedSellAmount: '1000000000000000000',
    executedSellAmountBeforeFees: '1000000000000000000',
  },
} as Order

function renderReceipt(children: ReactNode): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={getCowswapTheme(false)}>{children}</ThemeProvider>
    </I18nProvider>,
  )
}

describe('PrintedOrderReceipt', () => {
  it('renders fulfilled order details from the existing order model', () => {
    renderReceipt(
      <PrintedOrderReceipt
        order={order}
        chainId={SupportedChainId.MAINNET}
        receiverEnsName="trader.eth"
        winningSolver={{ solver: 'naive', displayName: 'CoW Solver', executedAmounts: { sell: '1', buy: '1' } }}
      />,
    )

    expect(screen.getByRole('status', { name: 'Completed swap receipt' })).not.toBeNull()
    expect(screen.getByRole('img', { name: 'CoW Swap' })).not.toBeNull()
    expect(screen.getByText('CASHCOW SYSTEMS')).not.toBeNull()
    expect(screen.queryByText(/^v\d+\.\d+\.\d+/)).toBeNull()
    expect(screen.getByText('Thanks for swapping')).not.toBeNull()
    expect(screen.getByText('Trade succeeded')).not.toBeNull()
    expect(screen.getByText('Ethereum')).not.toBeNull()
    expect(screen.getByText('10s')).not.toBeNull()
    expect(screen.getByText('trader.eth ↗')).not.toBeNull()
    expect(screen.getByText('CoW Solver')).not.toBeNull()
  })

  it('shows price improvement when surplus data is available', () => {
    renderReceipt(
      <PrintedOrderReceipt
        order={order}
        chainId={SupportedChainId.MAINNET}
        surplusData={{
          showSurplus: true,
          surplusPercent: '1',
          surplusAmount: CurrencyAmount.fromRawAmount(order.outputToken, '250000'),
          surplusFiatValue: CurrencyAmount.fromRawAmount(order.outputToken, '250000'),
          surplusToken: order.outputToken,
        }}
      />,
    )

    expect(screen.getByText('Price improvement')).not.toBeNull()
    expect(screen.getByTitle('0.25 USDC')).not.toBeNull()
  })
})

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { getRemainderAmountsWithoutSurplus } from 'legacy/state/orders/utils'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useOpenLimitOrderChartLines } from './useOpenLimitOrderChartLines'

jest.mock('legacy/state/orders/utils', () => ({ getRemainderAmountsWithoutSurplus: jest.fn() }))
jest.mock('utils/orderUtils/getUiOrderType', () => ({ getUiOrderType: jest.fn() }))

const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH')
const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
const OTHER = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'OTHER')

i18n.load('en-US', {})
i18n.activate('en-US')

beforeEach(() => {
  jest
    .mocked(getUiOrderType)
    .mockImplementation((order) => (order.id === 'swap' ? UiOrderType.SWAP : UiOrderType.LIMIT))
  jest.mocked(getRemainderAmountsWithoutSurplus).mockReturnValue({
    buyAmount: '60000000',
    sellAmount: '30000000000000000000',
  })
})

it('keeps matching pending limits, including native/wrapped pairs', () => {
  const orders = [
    order('valid'),
    order('hidden', { isHidden: true }),
    order('swap'),
    order('filled', { status: OrderStatus.FULFILLED }),
    order('other', { outputToken: OTHER }),
  ]
  expect(renderLines(orders).map(({ id }) => id)).toEqual(['open-order:valid'])
})

it('uses remaining amounts for labels, original price, and reversed/unfillable labels', () => {
  const [line] = renderLines([order('direct')])
  expect(line.labels).toEqual({ sell: 'Limit · Sell 30 WETH', buy: 'Limit · Buy 60 USDC' })
  expect(line.price.toSignificant(4)).toBe('2')
  jest.mocked(getRemainderAmountsWithoutSurplus).mockReturnValue({
    buyAmount: '2000000000000000000',
    sellAmount: '500000000',
  })
  const [reverse] = renderLines([order('reverse', { inputToken: USDC, outputToken: WETH, isUnfillable: true })])
  expect(reverse).toMatchObject({
    labels: { sell: 'Unfillable · Limit · Buy 2 WETH', buy: 'Unfillable · Limit · Sell 500 USDC' },
    variant: 'unfillable-order',
  })
})

function order(id: string, overrides: Partial<Order> = {}): Order {
  return {
    id,
    buyAmount: '120000000',
    sellAmount: '60000000000000000000',
    creationTime: '2026-08-19T10:00:00Z',
    inputToken: WETH,
    outputToken: USDC,
    kind: OrderKind.SELL,
    status: OrderStatus.PENDING,
    ...overrides,
  } as Order
}

function renderLines(orders: Order[]): ReturnType<typeof useOpenLimitOrderChartLines> {
  return renderHook(
    () =>
      useOpenLimitOrderChartLines({
        inputCurrency: NATIVE_CURRENCIES[SupportedChainId.MAINNET],
        outputCurrency: USDC,
        orders,
      }),
    {
      wrapper: ({ children }) => <I18nProvider i18n={i18n}>{children}</I18nProvider>,
    },
  ).result.current
}

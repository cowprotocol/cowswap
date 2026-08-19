import { PropsWithChildren, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, NativeCurrency, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { getRemainderAmountsWithoutSurplus } from 'legacy/state/orders/utils'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useOpenLimitOrderChartLines } from './useOpenLimitOrderChartLines'

jest.mock('legacy/state/orders/utils', () => ({ getRemainderAmountsWithoutSurplus: jest.fn() }))
jest.mock('utils/orderUtils/getUiOrderType', () => ({ getUiOrderType: jest.fn() }))

const getRemainderAmountsMock = jest.mocked(getRemainderAmountsWithoutSurplus)
const getUiOrderTypeMock = jest.mocked(getUiOrderType)
const WETH = new Token(SupportedChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH')
const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
const OTHER = new Token(SupportedChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'OTHER')

class TestNativeCurrency extends NativeCurrency {
  constructor() {
    super(SupportedChainId.MAINNET, 18, 'ETH', 'Ether')
  }

  override get wrapped(): Token {
    return WETH
  }

  override equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

const ETH = new TestNativeCurrency()

i18n.load('en-US', {})
i18n.activate('en-US')

beforeEach(() => {
  getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)
  getRemainderAmountsMock.mockImplementation((order) => ({
    buyAmount: order.buyAmount.toString(),
    sellAmount: order.sellAmount.toString(),
  }))
})

it('keeps every matching pending limit order in deterministic order', () => {
  const orders = [
    createOrder({ creationTime: '2026-08-19T10:00:00Z', id: 'b' }),
    createOrder({ creationTime: '2026-08-19T11:00:00Z', id: 'c', inputToken: USDC, outputToken: WETH }),
    createOrder({ creationTime: '2026-08-19T10:00:00Z', id: 'a' }),
  ]

  expect(renderLines(orders).map(({ id }) => id)).toEqual(['open-order:c', 'open-order:a', 'open-order:b'])
})

it('filters non-pending, hidden, non-limit, and different-pair orders', () => {
  const fulfilled = createOrder({ id: 'fulfilled', status: OrderStatus.FULFILLED })
  const hidden = createOrder({ id: 'hidden', isHidden: true })
  const swap = createOrder({ id: 'swap' })
  const otherPair = createOrder({ id: 'other', outputToken: OTHER })
  getUiOrderTypeMock.mockImplementation((order) => (order.id === 'swap' ? UiOrderType.SWAP : UiOrderType.LIMIT))

  expect(renderLines([fulfilled, hidden, swap, otherPair])).toEqual([])
})

it('matches native and wrapped currencies in either pair direction', () => {
  const direct = createOrder({ id: 'direct' })
  const reverse = createOrder({ id: 'reverse', inputToken: USDC, outputToken: WETH })

  expect(renderLines([direct, reverse], ETH, USDC)).toHaveLength(2)
})

it('uses the original ratio and labels relative to each chart token', () => {
  const sell = createOrder({ id: 'sell', sellAmount: tokenAmount(60, 18), buyAmount: tokenAmount(120, 6) })
  const buy = createOrder({
    id: 'buy',
    kind: OrderKind.BUY,
    sellAmount: tokenAmount(250, 18),
    buyAmount: tokenAmount(500, 6),
  })
  const unfillable = createOrder({ id: 'unfillable', isUnfillable: true })
  getRemainderAmountsMock.mockImplementation((order) => {
    if (order.id === 'sell') return { buyAmount: tokenAmount(60, 6), sellAmount: tokenAmount(30, 18) }

    return { buyAmount: order.buyAmount.toString(), sellAmount: order.sellAmount.toString() }
  })

  const lines = renderLines([sell, buy, unfillable])

  expect(lines.find(({ id }) => id === 'open-order:sell')).toMatchObject({
    label: 'Sell 30 WETH',
    labels: { buy: 'Buy 60 USDC', sell: 'Sell 30 WETH' },
    variant: 'open-order',
  })
  expect(lines.find(({ id }) => id === 'open-order:buy')).toMatchObject({
    label: 'Sell 250 WETH',
    labels: { buy: 'Buy 500 USDC', sell: 'Sell 250 WETH' },
    variant: 'open-order',
  })
  expect(lines.find(({ id }) => id === 'open-order:unfillable')).toMatchObject({
    label: 'Unfillable · Sell 60 WETH',
    labels: {
      buy: 'Unfillable · Buy 120 USDC',
      sell: 'Unfillable · Sell 60 WETH',
    },
    variant: 'unfillable-order',
  })
  expect(lines.find(({ id }) => id === 'open-order:sell')?.price.toSignificant(4)).toBe('2')
})

it('swaps chart-relative labels for a reverse order', () => {
  const reverse = createOrder({ id: 'reverse', inputToken: USDC, outputToken: WETH })
  getRemainderAmountsMock.mockReturnValue({ buyAmount: tokenAmount(2, 18), sellAmount: tokenAmount(500, 6) })

  expect(renderLines([reverse])[0]).toMatchObject({
    labels: { buy: 'Sell 500 USDC', sell: 'Buy 2 WETH' },
  })
})

function createOrder(overrides: Partial<Order> & Pick<Order, 'id'>): Order {
  return {
    buyAmount: tokenAmount(120, 6),
    creationTime: '2026-08-19T10:00:00Z',
    id: overrides.id,
    inputToken: WETH,
    isHidden: false,
    isUnfillable: false,
    kind: OrderKind.SELL,
    outputToken: USDC,
    sellAmount: tokenAmount(60, 18),
    status: OrderStatus.PENDING,
    ...overrides,
  } as Order
}

function I18nWrapper({ children }: PropsWithChildren): ReactNode {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}

function renderLines(
  orders: Order[],
  inputCurrency: Currency = WETH,
  outputCurrency: Currency = USDC,
): ReturnType<typeof useOpenLimitOrderChartLines> {
  return renderHook(() => useOpenLimitOrderChartLines({ inputCurrency, orders, outputCurrency }), {
    wrapper: I18nWrapper,
  }).result.current
}

function tokenAmount(value: number, decimals: number): string {
  return `${value}${'0'.repeat(decimals)}`
}

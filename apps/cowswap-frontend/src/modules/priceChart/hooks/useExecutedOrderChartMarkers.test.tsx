import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useAllOrdersMap } from 'legacy/state/orders/hooks'
import { PartialOrdersMap } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useExecutedOrderChartMarkers } from './useExecutedOrderChartMarkers'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('legacy/state/orders/hooks', () => ({ useAllOrdersMap: jest.fn() }))
jest.mock('legacy/state/orders/utils/deserializeOrder', () => ({ deserializeOrder: jest.fn() }))
jest.mock('utils/orderUtils/getUiOrderType', () => ({ getUiOrderType: jest.fn() }))

const ACCOUNT = '0x0000000000000000000000000000000000000001'
const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH')
const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
const OTHER = new Token(1, '0x0000000000000000000000000000000000000003', 18, 'OTHER')
const ETH = NATIVE_CURRENCIES[SupportedChainId.MAINNET]

i18n.load('en-US', {})
i18n.activate('en-US')

beforeEach(() => {
  jest.mocked(useWalletInfo).mockReturnValue({ account: ACCOUNT, chainId: 1 } as ReturnType<typeof useWalletInfo>)
  jest.mocked(deserializeOrder).mockImplementation((value) => value as unknown as Order)
  jest
    .mocked(getUiOrderType)
    .mockImplementation((order) => (order.id === 'hooks' ? UiOrderType.HOOKS : UiOrderType.SWAP))
})

it('uses executed amounts, matches native/wrapped tokens, and changes side with the chart token', () => {
  setOrders([order('trade')])
  const { result, rerender } = renderHook(
    ({ activeCurrency }) => useExecutedOrderChartMarkers({ activeCurrency, inputCurrency: ETH, outputCurrency: USDC }),
    {
      initialProps: { activeCurrency: ETH as typeof ETH | Token },
      wrapper: ({ children }) => <I18nProvider i18n={i18n}>{children}</I18nProvider>,
    },
  )
  expect(result.current[0]).toMatchObject({
    side: 'sell',
    activeAmount: '2',
    counterAmount: '4,000',
    timestamp: Date.parse('2026-08-19T10:00:00Z') / 1000,
  })
  rerender({ activeCurrency: USDC })
  expect(result.current[0]).toMatchObject({ side: 'buy', activeAmount: '4,000', counterAmount: '2' })
  expect(useAllOrdersMap).toHaveBeenCalledWith({ chainId: 1 })
})

it('excludes other accounts, pending/hidden orders, other pairs, unsupported types and invalid executions', () => {
  setOrders([
    order('account', { owner: OTHER.address }),
    order('pending', { status: OrderStatus.PENDING }),
    order('hidden', { isHidden: true }),
    order('pair', { outputToken: OTHER }),
    order('hooks'),
    order('time', { creationTime: 'invalid' }),
    order('amount', { apiAdditionalInfo: { executedBuyAmount: '0' } as Order['apiAdditionalInfo'] }),
  ])
  const { result } = renderHook(
    () => useExecutedOrderChartMarkers({ activeCurrency: ETH, inputCurrency: ETH, outputCurrency: USDC }),
    { wrapper: ({ children }) => <I18nProvider i18n={i18n}>{children}</I18nProvider> },
  )
  expect(result.current).toEqual([])
})

function order(id: string, overrides: Partial<Order> = {}): Order {
  return {
    id,
    owner: ACCOUNT,
    inputToken: WETH,
    outputToken: USDC,
    kind: OrderKind.SELL,
    sellAmount: '1000000000000000000',
    buyAmount: '2000000000',
    creationTime: '2026-08-19T10:00:00Z',
    status: OrderStatus.FULFILLED,
    apiAdditionalInfo: { executedBuyAmount: '4000000000', executedSellAmountBeforeFees: '2000000000000000000' },
    ...overrides,
  } as Order
}

function setOrders(orders: Order[]): void {
  jest
    .mocked(useAllOrdersMap)
    .mockReturnValue(Object.fromEntries(orders.map((order) => [order.id, order])) as unknown as PartialOrdersMap)
}

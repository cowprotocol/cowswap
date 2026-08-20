import { PropsWithChildren, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, NativeCurrency, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useAllOrdersMap } from 'legacy/state/orders/hooks'
import { PartialOrdersMap } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useExecutedOrderChartMarkers } from './useExecutedOrderChartMarkers'

import type { PriceChartSelection, PriceChartSymbolDescriptor } from '../lib/tradingView.types'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('legacy/state/orders/hooks', () => ({ useAllOrdersMap: jest.fn() }))
jest.mock('legacy/state/orders/utils/deserializeOrder', () => ({ deserializeOrder: jest.fn() }))
jest.mock('utils/orderUtils/getUiOrderType', () => ({ getUiOrderType: jest.fn() }))

const useWalletInfoMock = jest.mocked(useWalletInfo)
const useAllOrdersMapMock = jest.mocked(useAllOrdersMap)
const deserializeOrderMock = jest.mocked(deserializeOrder)
const getUiOrderTypeMock = jest.mocked(getUiOrderType)
const ACCOUNT = '0x0000000000000000000000000000000000000001'
const OTHER_ACCOUNT = '0x0000000000000000000000000000000000000002'
const ARBITRUM_ACCOUNT = '0x3De0A3F95Eb59Dc208FbEdEAAC43F5197C39709D'
const ARBITRUM_ORDER_ID =
  '0x0e33669d6815b2b6ec6985891466a293aee556fc5dbe7f32b433309c8e1afb973de0a3f95eb59dc208fbedeaac43f5197c39709d6a58ed89'
const WETH = new Token(SupportedChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH')
const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
const OTHER = new Token(SupportedChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 'OTHER')
const ARBITRUM_USDC = new Token(SupportedChainId.ARBITRUM_ONE, '0xaf88d065e77c8cc2239327c5edb3a432268e5831', 6, 'USDC')
const ARBITRUM_COW = new Token(SupportedChainId.ARBITRUM_ONE, '0xcb8b5cd20bdcaea9a010ac1f8d835824f5c87a04', 18, 'COW')

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
  useWalletInfoMock.mockReturnValue({ account: ACCOUNT, chainId: SupportedChainId.MAINNET } as ReturnType<
    typeof useWalletInfo
  >)
  deserializeOrderMock.mockImplementation((value) => value as unknown as Order)
  getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)
  useAllOrdersMapMock.mockReturnValue({})
})

it('reads the current chain and keeps all matching fulfilled order classes', () => {
  getUiOrderTypeMock.mockImplementation((order) => {
    if (order.id === 'swap') return UiOrderType.SWAP
    if (order.id === 'twap') return UiOrderType.TWAP
    if (order.id === 'hooks') return UiOrderType.HOOKS
    return UiOrderType.LIMIT
  })
  setOrders([
    createOrder({ id: 'swap', fulfillmentTime: '2026-08-19T10:02:00Z' }),
    createOrder({ id: 'limit', fulfillmentTime: '2026-08-19T10:01:00Z' }),
    createOrder({ id: 'twap', fulfillmentTime: '2026-08-19T10:01:00Z' }),
    createOrder({ id: 'hooks' }),
  ])

  expect(renderMarkers().map(({ id }) => id)).toEqual(['execution:limit', 'execution:twap', 'execution:swap'])
  expect(useAllOrdersMapMock).toHaveBeenCalledWith({ chainId: SupportedChainId.MAINNET })
})

it('filters another account, non-fulfilled state, hidden orders, different pairs, invalid times, and zero amounts', () => {
  setOrders([
    createOrder({ id: 'account', owner: OTHER_ACCOUNT }),
    createOrder({ id: 'pending', status: OrderStatus.PENDING }),
    createOrder({ id: 'hidden', isHidden: true }),
    createOrder({ id: 'pair', outputToken: OTHER }),
    createOrder({ creationTime: 'invalid', fulfillmentTime: undefined, id: 'time' }),
    createOrder({ executedBuyAmount: '0', id: 'amount' }),
  ])

  expect(renderMarkers()).toEqual([])
})

it('shows the historical Arbitrum order when the API omits its fulfillment time', () => {
  useWalletInfoMock.mockReturnValue({
    account: ARBITRUM_ACCOUNT,
    chainId: SupportedChainId.ARBITRUM_ONE,
  } as ReturnType<typeof useWalletInfo>)
  getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)
  setOrders([
    createOrder({
      apiAdditionalInfo: {
        executedBuyAmount: '5765707284504342758',
        executedSellAmountBeforeFees: '853122',
      } as Order['apiAdditionalInfo'],
      buyAmount: '5632335404266579604',
      creationTime: '2026-07-16T14:11:23.175623Z',
      fulfillmentTime: undefined,
      id: ARBITRUM_ORDER_ID,
      inputToken: ARBITRUM_USDC,
      outputToken: ARBITRUM_COW,
      owner: ARBITRUM_ACCOUNT,
      sellAmount: '853122',
    }),
  ])

  expect(renderMarkers('buy', ARBITRUM_USDC, ARBITRUM_COW)).toEqual([
    expect.objectContaining({
      activeAmount: '5.765',
      activeTokenSymbol: 'COW',
      counterAmount: '0.8531',
      counterTokenSymbol: 'USDC',
      id: `execution:${ARBITRUM_ORDER_ID}`,
      side: 'buy',
      timestamp: Date.parse('2026-07-16T14:11:23.175623Z') / 1000,
      title: 'Bought 5.765 COW for 0.8531 USDC',
    }),
  ])
})

it('matches native and wrapped tokens and changes the side with the selected chart token', () => {
  setOrders([createOrder({ id: 'trade' })])

  expect(renderMarkers('sell', ETH, USDC)[0]).toMatchObject({
    activeAmount: '2',
    activeTokenSymbol: 'WETH',
    counterAmount: '4,000',
    counterTokenSymbol: 'USDC',
    side: 'sell',
    title: 'Sold 2 WETH for 4,000 USDC',
  })
  expect(renderMarkers('buy', ETH, USDC)[0]).toMatchObject({
    activeAmount: '4,000',
    activeTokenSymbol: 'USDC',
    counterAmount: '2',
    counterTokenSymbol: 'WETH',
    side: 'buy',
    title: 'Bought 4,000 USDC for 2 WETH',
  })
})

it('returns no markers without an account', () => {
  useWalletInfoMock.mockReturnValue({ account: undefined, chainId: SupportedChainId.MAINNET } as ReturnType<
    typeof useWalletInfo
  >)
  setOrders([createOrder({ id: 'trade' })])

  expect(renderMarkers()).toEqual([])
})

function createOrder({
  executedBuyAmount = tokenAmount(4_000, 6),
  ...overrides
}: Partial<Order> & Pick<Order, 'id'> & { executedBuyAmount?: string }): Order {
  return {
    apiAdditionalInfo: {
      executedBuyAmount,
      executedSellAmountBeforeFees: tokenAmount(2, 18),
    } as Order['apiAdditionalInfo'],
    buyAmount: tokenAmount(4_000, 6),
    creationTime: '2026-08-19T09:00:00Z',
    fulfillmentTime: '2026-08-19T10:00:00Z',
    id: overrides.id,
    inputToken: WETH,
    isHidden: false,
    kind: OrderKind.SELL,
    outputToken: USDC,
    owner: ACCOUNT,
    sellAmount: tokenAmount(2, 18),
    status: OrderStatus.FULFILLED,
    ...overrides,
  } as Order
}

function I18nWrapper({ children }: PropsWithChildren): ReactNode {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}

function renderMarkers(
  selection: PriceChartSelection = 'sell',
  inputCurrency: Currency = WETH,
  outputCurrency: Currency = USDC,
): ReturnType<typeof useExecutedOrderChartMarkers> {
  const activeCurrency = selection === 'sell' ? inputCurrency : outputCurrency
  const symbol = {
    baseAsset: {
      address: activeCurrency.wrapped.address,
      chainId: activeCurrency.chainId,
      symbol: activeCurrency.symbol,
    },
    selection,
  } as PriceChartSymbolDescriptor

  return renderHook(() => useExecutedOrderChartMarkers({ activeSymbol: symbol, inputCurrency, outputCurrency }), {
    wrapper: I18nWrapper,
  }).result.current
}

function setOrders(orders: Order[]): void {
  useAllOrdersMapMock.mockReturnValue(
    Object.fromEntries(orders.map((order) => [order.id, order])) as unknown as PartialOrdersMap,
  )
}

function tokenAmount(value: number, decimals: number): string {
  return `${value}${'0'.repeat(decimals)}`
}

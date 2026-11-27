import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { mapCancelledOrder, mapPostedOrder } from '@cowprotocol/analytics'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { OnCancelledOrderPayload, OnPostedOrderPayload } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { eoaTwapOrdersAtom, twapOrdersAtom } from 'entities/twap'

import { useGetTwapOrderById, type TwapOrderByIdResult } from './useGetTwapOrderById'

import { TwapOrderStatus, type TwapOrderItem } from '../types'

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

const OWNER = '0x1111111111111111111111111111111111111111'
const PROXY = '0x2222222222222222222222222222222222222222'

describe('useGetTwapOrderById', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('finds indexed EOA TWAP orders and sets isEoaTwap true', () => {
    const store = createStore()
    const order = makeOrder('indexed-event', PROXY, OWNER)
    store.set(walletInfoAtom, { account: OWNER, chainId: SupportedChainId.GNOSIS_CHAIN })
    store.set(eoaTwapOrdersAtom, { [order.id]: order })

    const { result } = renderHook(() => useGetTwapOrderById(), {
      wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current(order.id)).toMatchObject({
      order: { uid: order.id },
      isEoaTwap: true,
    })
  })

  it('finds Safe TWAP orders in twapOrdersAtom and sets isEoaTwap false', () => {
    const store = createStore()
    const order = makeOrder('safe-order', OWNER, OWNER)
    store.set(walletInfoAtom, { account: OWNER, chainId: SupportedChainId.GNOSIS_CHAIN })
    store.set(twapOrdersAtom, { [order.id]: order })

    const { result } = renderHook(() => useGetTwapOrderById(), {
      wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current(order.id)).toMatchObject({
      order: { uid: order.id },
      isEoaTwap: false,
    })
  })

  it('returns null when the order is not in either atom', () => {
    const store = createStore()
    store.set(walletInfoAtom, { account: OWNER, chainId: SupportedChainId.GNOSIS_CHAIN })

    const { result } = renderHook(() => useGetTwapOrderById(), {
      wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current('missing')).toBeNull()
  })

  it('matches indexed EOA cancellation analytics to the submission order id and wallet', () => {
    const eventId = '49821'
    const conditionalOrderHash = `0x${'ab'.repeat(32)}`
    const order = makeOrder(eventId, PROXY, OWNER, { hash: conditionalOrderHash })
    const found = lookupOrder(eoaTwapOrdersAtom, order)

    expect(found.order.uid).toBe(eventId)
    expect(found.order.owner).toBe(PROXY)

    const posted = mapPostedOrder(postedPayload(conditionalOrderHash, OWNER, true))
    const cancelled = mapCancelledOrder(cancelledPayload(found))

    expect(cancelled.orderId).toBe(posted.orderId)
    expect(cancelled.walletAddress).toBe(posted.walletAddress)
    expect(cancelled.orderId).toBe(conditionalOrderHash)
    expect(cancelled.walletAddress).toBe(OWNER)
    expect(cancelled.isEoaTwap).toBe(true)
  })

  it('matches optimistic EOA cancellation analytics to the connected wallet', () => {
    const conditionalOrderHash = `0x${'ef'.repeat(32)}`
    const order = makeOrder(conditionalOrderHash, PROXY, OWNER, { hash: undefined })
    const found = lookupOrder(twapOrdersAtom, order)

    expect(found.order.uid).toBe(conditionalOrderHash)
    expect(found.order.owner).toBe(PROXY)

    const posted = mapPostedOrder(postedPayload(conditionalOrderHash, OWNER, true))
    const cancelled = mapCancelledOrder(cancelledPayload(found))

    expect(cancelled.orderId).toBe(posted.orderId)
    expect(cancelled.walletAddress).toBe(posted.walletAddress)
    expect(cancelled.isEoaTwap).toBe(true)
  })

  it('keeps Safe TWAP cancellation analytics on the conditional order id and Safe wallet', () => {
    const conditionalOrderId = `0x${'cd'.repeat(32)}`
    const order = makeOrder(conditionalOrderId, OWNER, OWNER, { hash: undefined })
    const found = lookupOrder(twapOrdersAtom, order)

    expect(found.order.uid).toBe(conditionalOrderId)
    expect(found.order.owner).toBe(OWNER)

    const posted = mapPostedOrder(postedPayload(conditionalOrderId, OWNER, false))
    const cancelled = mapCancelledOrder(cancelledPayload(found))

    expect(cancelled.orderId).toBe(posted.orderId)
    expect(cancelled.walletAddress).toBe(posted.walletAddress)
    expect(cancelled.isEoaTwap).toBe(false)
  })
})

function cancelledPayload(found: TwapOrderByIdResult): OnCancelledOrderPayload {
  return {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    order: found.order,
    orderType: UiOrderType.TWAP,
    transactionHash: '0xtx',
    isEoaTwap: found.isEoaTwap,
    analyticsOrderId: found.analyticsOrderId,
    analyticsWalletAddress: found.analyticsWalletAddress,
  }
}

function lookupOrder(
  atom: typeof eoaTwapOrdersAtom | typeof twapOrdersAtom,
  order: TwapOrderItem,
): TwapOrderByIdResult {
  const store = createStore()
  store.set(walletInfoAtom, { account: OWNER, chainId: SupportedChainId.GNOSIS_CHAIN })
  store.set(atom, { [order.id]: order })

  const { result } = renderHook(() => useGetTwapOrderById(), {
    wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
  })
  const found = result.current(order.id)

  if (!found) {
    throw new Error(`Missing TWAP order ${order.id}`)
  }

  return found
}

function makeOrder(id: string, safeAddress: string, resolvedOwner: string, options?: { hash?: string }): TwapOrderItem {
  return {
    id,
    hash: options && 'hash' in options ? options.hash : `hash-${id}`,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    safeAddress,
    resolvedOwner,
    status: TwapOrderStatus.Pending,
    submissionDate: new Date(0).toISOString(),
    order: {
      sellToken: '0x3333333333333333333333333333333333333333',
      buyToken: '0x4444444444444444444444444444444444444444',
      receiver: resolvedOwner,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: 0,
      n: 1,
      t: 60,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFee: '0' },
    },
  }
}

function postedPayload(orderId: string, owner: string, isEoaTwap: boolean): OnPostedOrderPayload {
  return {
    orderUid: orderId,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    owner,
    kind: OrderKind.SELL,
    orderType: UiOrderType.TWAP,
    inputAmount: 1n,
    outputAmount: 1n,
    inputToken: {
      address: '0x3333333333333333333333333333333333333333',
      decimals: 18,
      chainId: SupportedChainId.GNOSIS_CHAIN,
      symbol: 'SELL',
      name: 'Sell',
    },
    outputToken: {
      address: '0x4444444444444444444444444444444444444444',
      decimals: 18,
      chainId: SupportedChainId.GNOSIS_CHAIN,
      symbol: 'BUY',
      name: 'Buy',
    },
    isEoaTwap,
  }
}

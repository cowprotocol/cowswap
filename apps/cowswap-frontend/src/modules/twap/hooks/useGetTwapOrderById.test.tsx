import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { eoaTwapOrdersAtom, twapOrdersAtom, type TwapOrderItem } from 'entities/twap'

import { useGetTwapOrderById } from './useGetTwapOrderById'

import { TwapOrderStatus } from '../types'

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
})

function makeOrder(id: string, safeAddress: string, resolvedOwner: string): TwapOrderItem {
  return {
    id,
    hash: `hash-${id}`,
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

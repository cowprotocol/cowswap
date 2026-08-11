import { createStore, Provider, type PrimitiveAtom } from 'jotai'
import { ReactNode } from 'react'

import { MAXIMUM_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { jotaiStore } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { eoaTwapOrdersQueryAtom } from 'modules/twap/state/eoaTwapOrdersQueryAtom'

import { useLoadMoreOrders } from './useLoadMoreOrders'

import { apiOrdersAtom } from '../state/apiOrdersAtom'
import { ordersLimitAtom } from '../state/ordersLimitAtom'

jest.mock('modules/twap/state/eoaTwapOrdersQueryAtom', () => ({
  eoaTwapOrdersQueryAtom: jest.requireActual('jotai').atom({
    data: undefined,
    isFetching: false,
    isPlaceholderData: false,
  }),
}))

const OWNER = '0x1111111111111111111111111111111111111111'
const CHAIN_ID = SupportedChainId.GNOSIS_CHAIN
const writableEoaTwapOrdersQueryAtom = eoaTwapOrdersQueryAtom as PrimitiveAtom<{
  data: { totalCount: number } | undefined
  isFetching: boolean
  isPlaceholderData: boolean
}>

describe('useLoadMoreOrders', () => {
  it('stops loading more simple orders at the shared limit', () => {
    const store = createStore()
    const { result } = renderHook(() => useLoadMoreOrders(TabOrderTypes.LIMIT), {
      wrapper: testWrapper(store),
    })

    act(() => {
      store.set(ordersLimitAtom, MAXIMUM_ORDERS_TO_FETCH - 50)
      result.current.loadMore()
    })

    expect(result.current.limit).toBe(MAXIMUM_ORDERS_TO_FETCH)

    act(() => result.current.loadMore())

    expect(result.current.limit).toBe(MAXIMUM_ORDERS_TO_FETCH)
  })

  it('loads 100 more EOA TWAP parents and stops at the shared limit', () => {
    const store = createStore()
    store.set(writableEoaTwapOrdersQueryAtom, {
      data: { totalCount: MAXIMUM_ORDERS_TO_FETCH },
      isFetching: false,
      isPlaceholderData: false,
    })
    const { result } = renderHook(() => useLoadMoreOrders(TabOrderTypes.ADVANCED), {
      wrapper: testWrapper(store),
    })

    act(() => result.current.loadMore())
    expect(result.current.limit).toBe(200)

    act(() => {
      store.set(ordersLimitAtom, MAXIMUM_ORDERS_TO_FETCH)
    })
    expect(result.current).toMatchObject({ limit: MAXIMUM_ORDERS_TO_FETCH, hasMoreOrders: false })

    act(() => result.current.loadMore())
    expect(result.current.limit).toBe(MAXIMUM_ORDERS_TO_FETCH)
  })

  it('resets the visible request window for a different owner key', () => {
    jotaiStore.set(walletInfoAtom, { account: OWNER, chainId: CHAIN_ID })
    jotaiStore.set(ordersLimitAtom, 500)
    const { result } = renderHook(() => useLoadMoreOrders(TabOrderTypes.ADVANCED), {
      wrapper: testWrapper(jotaiStore),
    })

    expect(result.current.limit).toBe(100)

    act(() => {
      jotaiStore.set(ordersLimitAtom, 500)
      jotaiStore.set(walletInfoAtom, { account: OWNER.replace(/1/g, '2'), chainId: CHAIN_ID })
    })

    expect(result.current.limit).toBe(100)
  })

  it('ignores EOA TWAP query state outside the Advanced table', () => {
    const store = createStore()
    store.set(writableEoaTwapOrdersQueryAtom, {
      data: { totalCount: MAXIMUM_ORDERS_TO_FETCH },
      isFetching: true,
      isPlaceholderData: true,
    })
    const { result } = renderHook(() => useLoadMoreOrders(TabOrderTypes.LIMIT), {
      wrapper: testWrapper(store),
    })

    expect(result.current).toMatchObject({ isLoading: false, hasMoreOrders: false })
  })

  it('uses the simple orders load-more state', () => {
    const store = createStore()
    store.set(apiOrdersAtom, { orders: [], isLoadingMore: true })

    const { result } = renderHook(() => useLoadMoreOrders(TabOrderTypes.LIMIT), {
      wrapper: testWrapper(store),
    })

    expect(result.current).toMatchObject({ isLoading: true, hasMoreOrders: true })
  })
})

function testWrapper(store: ReturnType<typeof createStore>): ({ children }: { children: ReactNode }) => ReactNode {
  return function TestWrapper({ children }: { children: ReactNode }): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }
}

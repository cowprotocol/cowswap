import type { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'
import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { Order } from 'legacy/state/orders/actions'
import { updateLastCheckedBlock } from 'legacy/state/orders/actions'
import ordersReducer from 'legacy/state/orders/reducer'

import { useOrdersHydrationState } from './useOrdersHydrationState'

function createStore(): EnhancedStore {
  return configureStore({
    reducer: { orders: ordersReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  })
}

let currentStore: EnhancedStore | null = null

function TestStoreProvider({ children }: { children?: ReactNode }): ReactNode {
  if (!currentStore) {
    throw new Error('TestStoreProvider requires currentStore to be set before use')
  }

  return <Provider store={currentStore}>{children}</Provider>
}

describe('useOrdersHydrationState', () => {
  afterEach(() => {
    currentStore = null
  })

  it('returns true for empty accounts once polling completes', () => {
    const chainId = SupportedChainId.MAINNET
    currentStore = createStore()

    const { result, rerender } = renderHook(
      ({ injectedOrders }) => useOrdersHydrationState({ chainId, orders: injectedOrders }),
      {
        wrapper: TestStoreProvider,
        initialProps: { injectedOrders: [] as Order[] },
      },
    )

    expect(result.current).toBe(false)

    act(() => {
      currentStore?.dispatch(updateLastCheckedBlock({ chainId, lastCheckedBlock: Date.now() }))
    })

    rerender({ injectedOrders: [] as Order[] })

    expect(result.current).toBe(true)
  })

  it('returns true immediately when orders exist', () => {
    const chainId = SupportedChainId.MAINNET
    currentStore = createStore()

    const sampleOrder = { id: '1' } as unknown as Order

    const { result } = renderHook(
      ({ injectedOrders }) => useOrdersHydrationState({ chainId, orders: injectedOrders }),
      {
        wrapper: TestStoreProvider,
        initialProps: { injectedOrders: [sampleOrder] },
      },
    )

    expect(result.current).toBe(true)
  })
})

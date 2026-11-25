import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { renderHook } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { assetAccountTabAtomFamily } from './assetAccountTabAtom'
import { useWidgetOrderEventListeners } from './useWidgetOrderEventListeners'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'
import { awaitedOpenOrderAtom } from '@/widgets/account'

jest.mock('@/features/connect-wallet', () => ({ ConnectButton: () => null }))

const TICKER = 'XAU'
const ORDER_UID = '0xorder'

interface RenderedListeners {
  store: ReturnType<typeof createStore>
  invalidateQueries: jest.SpyInstance
  emit(event: CowWidgetEvents, payload: object): void
}

function renderListeners(): RenderedListeners {
  const store = createStore()
  const queryClient = new QueryClient()
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined)
  store.set(queryClientAtom, queryClient)
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result } = renderHook(() => useWidgetOrderEventListeners(TICKER), { wrapper })
  const listeners: CowWidgetEventListeners = result.current

  return {
    store,
    invalidateQueries,
    emit: (event, payload) => {
      const listener = listeners.find((item) => item.event === event)

      if (!listener) throw new Error(`No listener for ${event}`)

      const handler = listener.handler as unknown as (payload: object) => void
      handler(payload)
    },
  }
}

describe('useWidgetOrderEventListeners', () => {
  it.each(['SWAP', 'LIMIT', 'TWAP'])('opens the Open orders tab after a %s order is posted', (orderType) => {
    const { store, invalidateQueries, emit } = renderListeners()
    store.set(assetAccountTabAtomFamily(TICKER), 'activity')

    emit(CowWidgetEvents.ON_POSTED_ORDER, { orderType, orderUid: ORDER_UID })

    expect(store.get(assetAccountTabAtomFamily(TICKER))).toBe('orders')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
  })

  it('awaits the posted order', () => {
    const { store, emit } = renderListeners()

    emit(CowWidgetEvents.ON_POSTED_ORDER, { orderUid: ORDER_UID })

    expect(store.get(awaitedOpenOrderAtom)).toEqual({ id: ORDER_UID, until: expect.any(Number) })
  })

  it.each([
    CowWidgetEvents.ON_FULFILLED_ORDER,
    CowWidgetEvents.ON_CANCELLED_ORDER,
    CowWidgetEvents.ON_EXPIRED_ORDER,
    CowWidgetEvents.ON_PRESIGNED_ORDER,
  ])('refreshes the open orders and activity on %s, keeping the tab', (event) => {
    const { store, invalidateQueries, emit } = renderListeners()
    store.set(assetAccountTabAtomFamily(TICKER), 'activity')

    emit(event, { order: { uid: 'other' } })

    expect(store.get(assetAccountTabAtomFamily(TICKER))).toBe('activity')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [RWA_QUERY_KEY_ROOT, 'activity'] })
  })

  it.each([CowWidgetEvents.ON_FULFILLED_ORDER, CowWidgetEvents.ON_CANCELLED_ORDER, CowWidgetEvents.ON_EXPIRED_ORDER])(
    'stops awaiting the posted order on %s',
    (event) => {
      const { store, emit } = renderListeners()
      emit(CowWidgetEvents.ON_POSTED_ORDER, { orderUid: ORDER_UID })

      emit(event, { order: { uid: 'other' } })
      expect(store.get(awaitedOpenOrderAtom)).not.toBeNull()

      emit(event, { order: { uid: ORDER_UID } })
      expect(store.get(awaitedOpenOrderAtom)).toBeNull()
    },
  )
})

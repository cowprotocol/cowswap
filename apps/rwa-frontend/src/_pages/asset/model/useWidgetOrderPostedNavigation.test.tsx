import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

import { CowWidgetEvents, type OnPostedOrderPayload } from '@cowprotocol/events'

import { renderHook } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { assetAccountTabAtomFamily } from './assetAccountTabAtom'
import { useWidgetOrderPostedNavigation } from './useWidgetOrderPostedNavigation'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'

const TICKER = 'XAU'

interface RenderedNavigation {
  store: ReturnType<typeof createStore>
  invalidateQueries: jest.SpyInstance
  post(orderType: string): void
}

function renderNavigation(): RenderedNavigation {
  const store = createStore()
  const queryClient = new QueryClient()
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined)
  store.set(queryClientAtom, queryClient)
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result } = renderHook(() => useWidgetOrderPostedNavigation(TICKER), { wrapper })
  const [listener] = result.current

  if (listener.event !== CowWidgetEvents.ON_POSTED_ORDER) throw new Error('Unexpected listener')

  return {
    store,
    invalidateQueries,
    post: (orderType) => listener.handler({ orderType } as OnPostedOrderPayload),
  }
}

describe('useWidgetOrderPostedNavigation', () => {
  it.each(['LIMIT', 'TWAP'])('opens the Open orders tab with fresh orders after a %s order is posted', (orderType) => {
    const { store, invalidateQueries, post } = renderNavigation()

    post(orderType)

    expect(store.get(assetAccountTabAtomFamily(TICKER))).toBe('orders')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
  })

  it('keeps the current tab after a swap order is posted', () => {
    const { store, invalidateQueries, post } = renderNavigation()
    store.set(assetAccountTabAtomFamily(TICKER), 'activity')

    post('SWAP')

    expect(store.get(assetAccountTabAtomFamily(TICKER))).toBe('activity')
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})

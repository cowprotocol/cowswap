import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'
import { useConnection } from 'wagmi'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { renderHook } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import { assetAccountTabAtomFamily } from './assetAccountTabAtom'
import { useWidgetOrderEventListeners } from './useWidgetOrderEventListeners'

import type { RwaTokenSummary } from '@/entities/asset'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'
import { awaitedActivityOrderAtom, awaitedOpenOrderAtom } from '@/widgets/account'

jest.mock('@/features/connect-wallet', () => ({ ConnectButton: () => null }))
jest.mock('wagmi', () => ({ useConnection: jest.fn() }))

const TICKER = 'XAU'
const ORDER_UID = '0xorder'
const OWNER = '0x00000000000000000000000000000000000000aA'
const XAUT = { chainId: 1, address: '0x68749665FF8D2d112Fa859AA293F07A622782F38' } as RwaTokenSummary
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const ASSET = { ticker: TICKER, tokens: [XAUT] }

interface RenderedListeners {
  store: ReturnType<typeof createStore>
  invalidateQueries: jest.SpyInstance
  emit(event: CowWidgetEvents, payload: object): void
}

function outcome(uid: string, buyToken = XAUT.address): object {
  return { chainId: 1, order: { uid, sellToken: USDC, buyToken } }
}

function renderListeners(address: string | null = OWNER): RenderedListeners {
  jest.mocked(useConnection).mockReturnValue({ address: address ?? undefined } as ReturnType<typeof useConnection>)
  const store = createStore()
  const queryClient = new QueryClient()
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined)
  store.set(queryClientAtom, queryClient)
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result } = renderHook(() => useWidgetOrderEventListeners(ASSET), { wrapper })
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

  it('awaits the posted order in the open orders of the wallet and asset', () => {
    const { store, emit } = renderListeners()

    emit(CowWidgetEvents.ON_POSTED_ORDER, { orderUid: ORDER_UID })

    expect(store.get(awaitedOpenOrderAtom)).toEqual({
      id: ORDER_UID,
      owner: OWNER,
      scope: TICKER,
      until: expect.any(Number),
    })
  })

  it('awaits the filled order in the activity of the wallet and asset', () => {
    const { store, emit } = renderListeners()

    emit(CowWidgetEvents.ON_FULFILLED_ORDER, outcome(ORDER_UID))

    expect(store.get(awaitedActivityOrderAtom)).toEqual({
      id: ORDER_UID,
      owner: OWNER,
      scope: TICKER,
      until: expect.any(Number),
    })
  })

  it.each([
    ['another asset', outcome(ORDER_UID, '0x00000000000000000000000000000000000000cC')],
    ['a bridged buy', { chainId: 8453, order: { uid: ORDER_UID, sellToken: USDC, buyToken: USDC } }],
  ])('does not await activity for a fill of %s', (_, payload) => {
    const { store, emit } = renderListeners()

    emit(CowWidgetEvents.ON_FULFILLED_ORDER, payload)

    expect(store.get(awaitedActivityOrderAtom)).toBeNull()
  })

  it.each([CowWidgetEvents.ON_CANCELLED_ORDER, CowWidgetEvents.ON_EXPIRED_ORDER])(
    'does not await activity for %s',
    (event) => {
      const { store, emit } = renderListeners()

      emit(event, outcome(ORDER_UID))

      expect(store.get(awaitedActivityOrderAtom)).toBeNull()
    },
  )

  it('awaits nothing without a connected wallet', () => {
    const { store, emit } = renderListeners(null)

    emit(CowWidgetEvents.ON_POSTED_ORDER, { orderUid: ORDER_UID })
    emit(CowWidgetEvents.ON_FULFILLED_ORDER, outcome(ORDER_UID))

    expect(store.get(awaitedOpenOrderAtom)).toBeNull()
    expect(store.get(awaitedActivityOrderAtom)).toBeNull()
  })

  it.each([
    CowWidgetEvents.ON_FULFILLED_ORDER,
    CowWidgetEvents.ON_CANCELLED_ORDER,
    CowWidgetEvents.ON_EXPIRED_ORDER,
    CowWidgetEvents.ON_PRESIGNED_ORDER,
  ])('refreshes the open orders and activity on %s, keeping the tab', (event) => {
    const { store, invalidateQueries, emit } = renderListeners()
    store.set(assetAccountTabAtomFamily(TICKER), 'activity')

    emit(event, outcome('other'))

    expect(store.get(assetAccountTabAtomFamily(TICKER))).toBe('activity')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [RWA_QUERY_KEY_ROOT, 'activity'] })
  })

  it.each([CowWidgetEvents.ON_FULFILLED_ORDER, CowWidgetEvents.ON_CANCELLED_ORDER, CowWidgetEvents.ON_EXPIRED_ORDER])(
    'stops awaiting the posted order on %s',
    (event) => {
      const { store, emit } = renderListeners()
      emit(CowWidgetEvents.ON_POSTED_ORDER, { orderUid: ORDER_UID })

      emit(event, outcome('other'))
      expect(store.get(awaitedOpenOrderAtom)).not.toBeNull()

      emit(event, outcome(ORDER_UID))
      expect(store.get(awaitedOpenOrderAtom)).toBeNull()
    },
  )
})

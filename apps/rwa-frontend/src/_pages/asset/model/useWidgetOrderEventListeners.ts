import { useStore } from 'jotai'
import { useMemo } from 'react'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { queryClientAtom } from 'jotai-tanstack-query'

import { assetAccountTabAtomFamily } from './assetAccountTabAtom'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'
import { awaitedOpenOrderAtom } from '@/widgets/account'

const AWAIT_POSTED_ORDER_MS = 60_000

const ORDER_CLOSED_EVENTS = [
  CowWidgetEvents.ON_FULFILLED_ORDER,
  CowWidgetEvents.ON_CANCELLED_ORDER,
  CowWidgetEvents.ON_EXPIRED_ORDER,
] as const

export function useWidgetOrderEventListeners(ticker: string): CowWidgetEventListeners {
  const store = useStore()

  return useMemo(() => {
    const refreshAccount = (): void => {
      const queryClient = store.get(queryClientAtom)

      void queryClient.invalidateQueries({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
      void queryClient.invalidateQueries({ queryKey: [RWA_QUERY_KEY_ROOT, 'activity'] })
    }

    return [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: ({ orderUid }) => {
          store.set(assetAccountTabAtomFamily(ticker), 'orders')
          store.set(awaitedOpenOrderAtom, { id: orderUid, until: Date.now() + AWAIT_POSTED_ORDER_MS })
          refreshAccount()
        },
      },
      ...ORDER_CLOSED_EVENTS.map((event) => ({
        event,
        handler: ({ order }: { order: { uid: string } }) => {
          store.set(awaitedOpenOrderAtom, (awaited) => (awaited?.id === order.uid ? null : awaited))
          refreshAccount()
        },
      })),
      { event: CowWidgetEvents.ON_PRESIGNED_ORDER, handler: refreshAccount },
    ]
  }, [store, ticker])
}

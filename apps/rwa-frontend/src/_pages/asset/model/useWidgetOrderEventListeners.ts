import { useStore } from 'jotai'
import { useMemo } from 'react'

import { useConnection } from 'wagmi'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { queryClientAtom } from 'jotai-tanstack-query'

import { assetAccountTabAtomFamily } from './assetAccountTabAtom'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'
import { awaitedActivityOrderAtom, awaitedOpenOrderAtom, type AwaitedOrder } from '@/widgets/account'

const AWAIT_ORDER_MS = 60_000

const ORDER_CLOSED_EVENTS = [
  CowWidgetEvents.ON_FULFILLED_ORDER,
  CowWidgetEvents.ON_CANCELLED_ORDER,
  CowWidgetEvents.ON_EXPIRED_ORDER,
] as const

export function useWidgetOrderEventListeners(ticker: string): CowWidgetEventListeners {
  const store = useStore()
  const { address } = useConnection()

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
          store.set(awaitedOpenOrderAtom, getAwaitedOrder(orderUid, address, ticker))
          refreshAccount()
        },
      },
      ...ORDER_CLOSED_EVENTS.map((event) => ({
        event,
        handler: ({ order }: { order: { uid: string } }) => {
          store.set(awaitedOpenOrderAtom, (awaited) => (awaited?.id === order.uid ? null : awaited))
          if (event === CowWidgetEvents.ON_FULFILLED_ORDER) {
            store.set(awaitedActivityOrderAtom, getAwaitedOrder(order.uid, address, ticker))
          }
          refreshAccount()
        },
      })),
      { event: CowWidgetEvents.ON_PRESIGNED_ORDER, handler: refreshAccount },
    ]
  }, [store, ticker, address])
}

function getAwaitedOrder(id: string, owner: string | undefined, scope: string): AwaitedOrder | null {
  return owner ? { id, owner, scope, until: Date.now() + AWAIT_ORDER_MS } : null
}

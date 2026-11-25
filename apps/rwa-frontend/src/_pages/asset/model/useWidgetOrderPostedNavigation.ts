import { useStore } from 'jotai'
import { useMemo } from 'react'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { queryClientAtom } from 'jotai-tanstack-query'

import { assetAccountTabAtomFamily } from './assetAccountTabAtom'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'

export function useWidgetOrderPostedNavigation(ticker: string): CowWidgetEventListeners {
  const store = useStore()

  return useMemo(
    () => [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: () => {
          store.set(assetAccountTabAtomFamily(ticker), 'orders')
          void store.get(queryClientAtom).invalidateQueries({ queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders'] })
        },
      },
    ],
    [store, ticker],
  )
}

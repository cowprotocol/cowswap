import { atom } from 'jotai'

import type { CancellationType } from '../api/cancelOrder'

export type OrderCancellation =
  | { status: 'signing'; type: CancellationType }
  | { status: 'pending'; type: 'hard'; txHash: string }
  | { status: 'cancelled'; type: CancellationType }
  | { status: 'failed'; type: CancellationType; error: string }

/** By order uid. A cancelled order keeps its entry until the open orders refetch drops it */
export const orderCancellationsAtom = atom<Record<string, OrderCancellation>>({})

export const setOrderCancellationAtom = atom(null, (get, set, uid: string, cancellation: OrderCancellation | null) => {
  const { [uid]: _previous, ...rest } = get(orderCancellationsAtom)

  set(orderCancellationsAtom, cancellation ? { ...rest, [uid]: cancellation } : rest)
})

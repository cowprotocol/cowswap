import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { ordersToCancelAtom } from './ordersToCancel.atom'

export function useOrdersToCancelMap(): Record<string, true> {
  const ordersToCancel = useAtomValue(ordersToCancelAtom)

  return useMemo(() => {
    if (!ordersToCancel) return {}

    return ordersToCancel.reduce(
      (acc, val) => {
        acc[val.id] = true
        return acc
      },
      {} as Record<string, true>,
    )
  }, [ordersToCancel])
}

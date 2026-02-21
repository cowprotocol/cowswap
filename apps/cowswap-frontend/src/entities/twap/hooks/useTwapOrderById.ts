import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { TwapOrderItem } from 'modules/twap'

import { twapOrdersAtom } from '../state/twapOrdersAtom'

export function useTwapOrderById(orderId: string | undefined): TwapOrderItem | null {
  const twapOrdersList = useAtomValue(twapOrdersAtom)

  return useMemo(() => {
    return (orderId && twapOrdersList[orderId]) || null
  }, [orderId, twapOrdersList])
}

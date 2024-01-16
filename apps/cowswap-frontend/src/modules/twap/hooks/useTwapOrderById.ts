import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { twapOrdersAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem } from '../types'

export function useTwapOrderById(orderId: string | undefined): TwapOrderItem | null {
  const twapOrdersList = useAtomValue(twapOrdersAtom)

  return useMemo(() => {
    return (orderId && twapOrdersList[orderId]) || null
  }, [orderId, twapOrdersList])
}

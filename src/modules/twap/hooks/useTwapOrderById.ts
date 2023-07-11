import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem } from '../types'

export function useTwapOrderById(orderId: string | undefined): TwapOrderItem | null {
  const twapOrdersList = useAtomValue(twapOrdersListAtom)

  return useMemo(() => {
    return (orderId && twapOrdersList[orderId]) || null
  }, [orderId, twapOrdersList])
}

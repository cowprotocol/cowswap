import { useMemo } from 'react'

import { useTwapOrderById } from './useTwapOrderById'
import { useTwapPartOrdersList } from './useTwapPartOrdersList'

import { TwapOrderItem } from '../types'

export function useTwapOrderByChildId(orderId: string | undefined): TwapOrderItem | null {
  const twapPartOrdersList = useTwapPartOrdersList()

  const parentId = useMemo(() => {
    return twapPartOrdersList.find(({ uid }) => uid === orderId)?.twapOrderId
  }, [orderId, twapPartOrdersList])

  return useTwapOrderById(parentId)
}

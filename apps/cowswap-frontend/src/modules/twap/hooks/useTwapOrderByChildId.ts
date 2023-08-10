import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useTwapOrderById } from './useTwapOrderById'

import { twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

export function useTwapOrderByChildId(orderId: string | undefined): TwapOrderItem | null {
  const twapPartOrdersList = useAtomValue(twapPartOrdersListAtom)

  const parentId = useMemo(() => {
    return twapPartOrdersList.find(({ uid }) => uid === orderId)?.twapOrderId
  }, [orderId, twapPartOrdersList])

  return useTwapOrderById(parentId)
}

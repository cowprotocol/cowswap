import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { useTwapOrderById } from 'entities/twap'
import { twapPartOrdersListAtom } from 'modules/twap/state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

export function useTwapOrderByChildId(orderId: string | undefined): TwapOrderItem | null {
  const twapPartOrdersList = useAtomValue(twapPartOrdersListAtom)

  const parentId = useMemo(() => {
    return twapPartOrdersList.find(({ uid }) => uid === orderId)?.twapOrderId
  }, [orderId, twapPartOrdersList])

  return useTwapOrderById(parentId)
}

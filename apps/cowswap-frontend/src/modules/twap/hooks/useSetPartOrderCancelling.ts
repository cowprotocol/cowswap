import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updatePartOrdersAtom } from '../state/twapPartOrdersAtom'

export function useSetPartOrderCancelling() {
  const updatePartOrders = useSetAtom(updatePartOrdersAtom)

  return useCallback(
    (orderId: string) => {
      return updatePartOrders({ [orderId]: { isCancelling: true } })
    },
    [updatePartOrders]
  )
}

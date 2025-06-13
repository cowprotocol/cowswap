import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updatePartOrdersAtom } from '../state/twapPartOrdersAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetPartOrderCancelling() {
  const updatePartOrders = useSetAtom(updatePartOrdersAtom)

  return useCallback(
    (orderId: string) => {
      return updatePartOrders({ [orderId]: { isCancelling: true } })
    },
    [updatePartOrders]
  )
}

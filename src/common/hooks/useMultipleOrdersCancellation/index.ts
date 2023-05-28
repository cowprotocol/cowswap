import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { Order } from 'legacy/state/orders/actions'


export function useMultipleOrdersCancellation() {
  const setOrdersToCancel = useUpdateAtom(updateOrdersToCancelAtom)
  const openModal = useOpenModal(ApplicationModal.MULTIPLE_CANCELLATION)

  return useCallback(
    (orders: Order[]) => {
      setOrdersToCancel(orders)
      openModal()
    },
    [openModal, setOrdersToCancel]
  )
}

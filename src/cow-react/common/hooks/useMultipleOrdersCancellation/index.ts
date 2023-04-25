import { useCallback } from 'react'
import { Order } from 'state/orders/actions'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useUpdateAtom } from 'jotai/utils'
import { updateOrdersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'

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

import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { CancellableOrder } from 'common/utils/isOrderCancellable'

export function useMultipleOrdersCancellation() {
  const setOrdersToCancel = useUpdateAtom(updateOrdersToCancelAtom)
  const openModal = useOpenModal(ApplicationModal.MULTIPLE_CANCELLATION)

  return useCallback(
    (orders: CancellableOrder[]) => {
      setOrdersToCancel(orders)
      openModal()
    },
    [openModal, setOrdersToCancel]
  )
}

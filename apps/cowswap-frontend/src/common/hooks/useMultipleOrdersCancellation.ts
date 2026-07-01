import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { updateOrdersToCancelAtom } from 'entities/ordersToCancel/ordersToCancel.atom'

import { useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { buildOrdersWidgetHookPayload, callWidgetHook } from 'modules/injectedWidget'

import { CancellableOrder } from 'common/utils/isOrderCancellable'

export function useMultipleOrdersCancellation(): (orders: CancellableOrder[]) => void {
  const setOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const openModal = useOpenModal(ApplicationModal.MULTIPLE_CANCELLATION)

  return useCallback(
    (orders: CancellableOrder[]) => {
      void (async () => {
        const isWidgetHookPassed = await callWidgetHook(
          WidgetHookEvents.ON_BEFORE_ORDERS_CANCEL,
          buildOrdersWidgetHookPayload(orders),
        ).catch(() => false)

        if (!isWidgetHookPassed) {
          return
        }

        setOrdersToCancel(orders)
        openModal()
      })()
    },
    [openModal, setOrdersToCancel],
  )
}

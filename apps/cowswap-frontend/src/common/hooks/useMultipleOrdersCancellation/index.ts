import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { buildOrdersWidgetHookPayload, callWidgetHook } from 'modules/injectedWidget'

import { updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { CancellableOrder } from 'common/utils/isOrderCancellable'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useMultipleOrdersCancellation() {
  const { chainId } = useWalletInfo()
  const setOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const openModal = useOpenModal(ApplicationModal.MULTIPLE_CANCELLATION)

  return useCallback(
    (orders: CancellableOrder[]) => {
      void (async () => {
        const isWidgetHookPassed =
          orders.length && chainId
            ? await callWidgetHook(
                WidgetHookEvents.ON_BEFORE_ORDERS_CANCEL,
                buildOrdersWidgetHookPayload(chainId, orders),
              )
            : true

        if (!isWidgetHookPassed) {
          return
        }

        setOrdersToCancel(orders)
        openModal()
      })()
    },
    [chainId, openModal, setOrdersToCancel],
  )
}

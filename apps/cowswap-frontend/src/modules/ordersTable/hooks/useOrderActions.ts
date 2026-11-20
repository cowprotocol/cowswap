import { useAtomValue, useSetAtom } from 'jotai/index'
import { useCallback, useMemo } from 'react'

import { isRejectRequestProviderError, normalizeError } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'entities/ordersToCancel/ordersToCancel.atom'

import { ordersTableStateAtom } from 'modules/ordersTable/state/ordersTable.atoms'

import { MAX_SOLANA_BATCH_CANCEL_ORDERS } from 'common/constants/common'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useOrdersTableTokenApprove } from './useOrdersTableTokenApprove'
import { useSolanaReclaimableRent } from './useSolanaReclaimableRent'
import { useSolanaReclaimRent } from './useSolanaReclaimRent'

import {
  useGetAlternativeOrderModalContextCallback,
  useSelectReceiptOrder,
} from '../containers/OrdersReceiptModal/OrdersReceiptModal.hooks'
import { OrderActions } from '../state/ordersTable.types'

export function useOrderActions(): OrderActions {
  const { reduxOrders: allOrders } = useAtomValue(ordersTableStateAtom)
  const { chainId } = useWalletInfo()
  const cancelOrder = useCancelOrder()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const selectReceiptOrder = useSelectReceiptOrder()
  const reclaimableRent = useSolanaReclaimableRent()
  const reclaimRent = useSolanaReclaimRent()
  const addSnackbar = useAddSnackbar()
  // Solana batch cancellation bundles the whole selection into a single transaction, so the selection
  // is capped well below the point where it could overflow the transaction size limit.
  const isSolana = isSolanaChain(chainId)

  const toggleOrdersForCancellation = useCallback(
    (orders: ParsedOrder[]) => {
      updateOrdersToCancel(isSolana ? orders.slice(0, MAX_SOLANA_BATCH_CANCEL_ORDERS) : orders)
    },
    [updateOrdersToCancel, isSolana],
  )

  const toggleOrderForCancellation = useCallback(
    (order: ParsedOrder) => {
      updateOrdersToCancel(toggleOrderInCancellationList(ordersToCancel, order, isSolana))
    },
    [ordersToCancel, updateOrdersToCancel, isSolana],
  )

  const getShowCancellationModal = useCallback(
    (order: ParsedOrder) => {
      if (order.isEoaTwapOrder && order.composableCowInfo?.isVirtualPart) return null
      const rawOrder = order.cancellationOrder ?? allOrders.find((item) => item.id === order.id)

      return rawOrder ? cancelOrder(rawOrder) : null
    },
    [allOrders, cancelOrder],
  )

  const getReclaimRent = useCallback(
    (order: ParsedOrder) => {
      if (!reclaimableRent.orderIds.has(order.id)) return null

      return () => {
        reclaimRent([{ id: order.id, placedAt: order.creationTime.getTime() }])
          .then(() => reclaimableRent.markReclaimed([order.id]))
          .catch((err: unknown) => {
            const error = normalizeError(err)

            if (!isRejectRequestProviderError(error)) {
              addSnackbar({
                id: `reclaim-rent-${order.id}`,
                icon: 'alert',
                content: error.message,
              })
            }

            reclaimableRent.refresh()
          })
      }
    },
    [reclaimableRent, reclaimRent, addSnackbar],
  )

  const getAlternativeOrderModalContext = useGetAlternativeOrderModalContextCallback()

  const approveOrderToken = useOrdersTableTokenApprove()

  return useMemo(
    () => ({
      getShowCancellationModal,
      getReclaimRent,
      getAlternativeOrderModalContext,
      selectReceiptOrder,
      toggleOrderForCancellation,
      toggleOrdersForCancellation,
      approveOrderToken,
    }),
    [
      getShowCancellationModal,
      getReclaimRent,
      getAlternativeOrderModalContext,
      selectReceiptOrder,
      toggleOrderForCancellation,
      toggleOrdersForCancellation,
      approveOrderToken,
    ],
  )
}

function toggleOrderInCancellationList(
  state: CancellableOrder[],
  order: CancellableOrder,
  capSelection: boolean,
): CancellableOrder[] {
  const isOrderIncluded = state.find((item) => item.id === order.id)

  if (isOrderIncluded) {
    return state.filter((item) => item.id !== order.id)
  }

  if (capSelection && state.length >= MAX_SOLANA_BATCH_CANCEL_ORDERS) {
    return state
  }

  return [...state, order]
}

import React, { useEffect, useMemo, useCallback, useRef } from 'react'

import { useIsExpertMode } from '@src/state/user/hooks'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { Order } from 'state/orders/actions'
import {
  useUpdateAtom,
  useAtomValue,
  handleFollowPendingTxPopupAtom,
  handleHidePopupPermanentlyAtom,
  showFollowTxPopupAtom,
  followPendingTxPopupAtom,
  selectAtom,
  handleCloseOrderPopupAtom,
} from 'state/application/atoms'
import FollowPendingTxPopupUI from './FollowPendingTxPopupUI'
import { isPending } from 'components/Web3Status'
import { OrderID } from '@src/custom/api/gnosisProtocol'

interface AddedOrder extends Order {
  addedTime: number
}

function isAnOrder(element: TransactionAndOrder): element is AddedOrder {
  return 'inputToken' in element && 'outputToken' in element
}

function _cutOrderId(orderId: OrderID) {
  return orderId.slice(0, 10)
}

export const useLastPendingOrder = (): { lastPendingOrder: AddedOrder | null; onClose: () => void } => {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setLastOrderClosed = useUpdateAtom(handleCloseOrderPopupAtom)
  const allRecentActivity = useRecentActivity()
  const lastPendingOrder = useMemo(() => {
    const pendings = allRecentActivity.filter(isPending)
    const lastOrder = pendings[pendings.length - 1]

    if (!lastOrder || !isAnOrder(lastOrder)) return null

    return lastOrder
  }, [allRecentActivity])

  const onClose = useCallback(() => {
    lastPendingOrder && setLastOrderClosed(_cutOrderId(lastPendingOrder.id))
    setShowFollowPendingTxPopup(false)
  }, [lastPendingOrder, setLastOrderClosed, setShowFollowPendingTxPopup])

  return { lastPendingOrder, onClose }
}

// Set pop up closed if it has not been closed and not fulfill a condition such as not pending tx
export function useCloseFollowTxPopupIfNotPendingOrder() {
  const showingPopup = useAtomValue(showFollowTxPopupAtom)
  const { lastPendingOrder, onClose } = useLastPendingOrder()
  const onCloseRef = useRef<() => void>()

  useEffect(() => {
    if (lastPendingOrder && showingPopup) {
      onCloseRef.current = onClose
    } else if (!lastPendingOrder && showingPopup && onCloseRef.current) {
      onCloseRef.current()
    }
  }, [lastPendingOrder, onClose, showingPopup])
}

const useShowingPopupFirstTime = (orderId: OrderID | undefined) => {
  const showingPopup = useAtomValue(showFollowTxPopupAtom)
  const _orderPopupHasBeenClosed = useMemo(
    () =>
      selectAtom(followPendingTxPopupAtom, ({ lastOrderPopupClosed }) => {
        if (!orderId) return

        return lastOrderPopupClosed === _cutOrderId(orderId)
      }),
    [orderId]
  )

  const orderPopupHasBeenClosed = useAtomValue(_orderPopupHasBeenClosed)

  return { showPopup: !orderPopupHasBeenClosed && showingPopup, orderPopupHasBeenClosed }
}

const FollowPendingTxPopup: React.FC = ({ children }): JSX.Element => {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setHidePendingTxPopupPermanently = useUpdateAtom(handleHidePopupPermanentlyAtom)
  const isExpertMode = useIsExpertMode()
  const { lastPendingOrder, onClose } = useLastPendingOrder()
  const { showPopup: showFollowPendingTxPopup, orderPopupHasBeenClosed } = useShowingPopupFirstTime(
    lastPendingOrder?.id
  )

  useEffect(() => {
    if (isExpertMode && lastPendingOrder && !orderPopupHasBeenClosed) {
      setShowFollowPendingTxPopup(true)
    }
  }, [isExpertMode, lastPendingOrder, orderPopupHasBeenClosed, setShowFollowPendingTxPopup])

  return (
    <FollowPendingTxPopupUI
      show={showFollowPendingTxPopup}
      onCheck={() => setHidePendingTxPopupPermanently(true)}
      onClose={onClose}
    >
      {children}
    </FollowPendingTxPopupUI>
  )
}

export default FollowPendingTxPopup

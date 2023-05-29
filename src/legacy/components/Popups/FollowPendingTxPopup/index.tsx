import React, { useEffect, useMemo, useCallback, useRef, PropsWithChildren } from 'react'

import { useRecentActivityLastPendingOrder } from 'legacy/hooks/useRecentActivity'
import {
  useUpdateAtom,
  useAtomValue,
  handleFollowPendingTxPopupAtom,
  handleHidePopupPermanentlyAtom,
  showFollowTxPopupAtom,
  followPendingTxPopupAtom,
  selectAtom,
  handleCloseOrderPopupAtom,
} from 'legacy/state/application/atoms'
import { Order } from 'legacy/state/orders/actions'
import { useIsExpertMode } from 'legacy/state/user/hooks'

import { OrderID } from 'api/gnosisProtocol'

import { FollowPendingTxPopupUI } from './FollowPendingTxPopupUI'

export function useLastPendingOrder(): { lastPendingOrder: Order | null; onClose: () => void } {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setLastOrderClosed = useUpdateAtom(handleCloseOrderPopupAtom)
  const lastPendingOrder = useRecentActivityLastPendingOrder()

  const onClose = useCallback(() => {
    lastPendingOrder && setLastOrderClosed(lastPendingOrder.id)
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
  const _firstTimePopupOrderAppears = useMemo(
    () =>
      selectAtom(followPendingTxPopupAtom, ({ lastOrderPopupClosed }) => {
        if (!orderId) return false

        return lastOrderPopupClosed !== orderId
      }),
    [orderId]
  )

  const firstTimePopupOrderAppears = useAtomValue(_firstTimePopupOrderAppears)

  return { showPopup: firstTimePopupOrderAppears && showingPopup, firstTimePopupOrderAppears }
}

const FollowPendingTxPopup: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setHidePendingTxPopupPermanently = useUpdateAtom(handleHidePopupPermanentlyAtom)
  const isExpertMode = useIsExpertMode()
  const { lastPendingOrder, onClose } = useLastPendingOrder()
  const { showPopup: showFollowPendingTxPopup, firstTimePopupOrderAppears } = useShowingPopupFirstTime(
    lastPendingOrder?.id
  )

  useEffect(() => {
    if (isExpertMode && lastPendingOrder && firstTimePopupOrderAppears) {
      setShowFollowPendingTxPopup(true)
    }
  }, [isExpertMode, lastPendingOrder, firstTimePopupOrderAppears, setShowFollowPendingTxPopup])

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

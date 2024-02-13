import { useAtomValue, useSetAtom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import React, { useEffect, useMemo, useCallback, useRef, PropsWithChildren } from 'react'

import { useRecentActivityLastPendingOrder } from 'legacy/hooks/useRecentActivity'
import { Order } from 'legacy/state/orders/actions'
import { useIsExpertMode } from 'legacy/state/user/hooks'

import { FollowPendingTxPopupUI } from './FollowPendingTxPopupUI'

import { useSetShowFollowPendingTxPopup } from '../../hooks/useSetShowFollowPendingTxPopup'
import {
  handleFollowPendingTxPopupAtom,
  handleHidePopupPermanentlyAtom,
  showFollowTxPopupAtom,
  followPendingTxPopupAtom,
  handleCloseOrderPopupAtom,
} from '../../state/followPendingTxPopupAtom'

export function useLastPendingOrder(): { lastPendingOrder: Order | null; onClose: () => void } {
  const setShowFollowPendingTxPopup = useSetAtom(handleFollowPendingTxPopupAtom)
  const setLastOrderClosed = useSetAtom(handleCloseOrderPopupAtom)
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

const useShowingPopupFirstTime = (orderId: string | undefined) => {
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

export const FollowPendingTxPopup: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const setShowFollowPendingTxPopup = useSetShowFollowPendingTxPopup()
  const setHidePendingTxPopupPermanently = useSetAtom(handleHidePopupPermanentlyAtom)
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

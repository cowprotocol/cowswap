import React, { useEffect, useMemo } from 'react'

import { useIsExpertMode } from '@src/state/user/hooks'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { Order } from 'state/orders/actions'
import {
  useUpdateAtom,
  useAtomValue,
  handleFollowPendingTxPopupAtom,
  handleHidePopupPermanentlyAtom,
  showFollowTxPopupAtom,
} from 'state/application/atoms'
import FollowPendingTxPopupUI from './FollowPendingTxPopupUI'
import { isPending } from 'components/Web3Status'

function isAnOrder(element: TransactionAndOrder): element is Order & { addedTime: number } {
  return 'inputToken' in element && 'outputToken' in element
}

const FollowPendingTxPopup: React.FC = ({ children }): JSX.Element => {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setHidePendingTxPopupPermanently = useUpdateAtom(handleHidePopupPermanentlyAtom)
  const showFollowPendingTxPopup = useAtomValue(showFollowTxPopupAtom)
  const isExpertMode = useIsExpertMode()
  const allRecentActivity = useRecentActivity()
  const pendingOrder = useMemo(() => {
    if (!isExpertMode) return
    const pendings = allRecentActivity.filter(isPending)

    return isAnOrder(pendings[pendings.length - 1])
  }, [allRecentActivity, isExpertMode])

  useEffect(() => {
    if (isExpertMode && pendingOrder) {
      setShowFollowPendingTxPopup(true)
    }
  }, [isExpertMode, pendingOrder, setShowFollowPendingTxPopup])

  return (
    <FollowPendingTxPopupUI
      show={showFollowPendingTxPopup}
      onCheckout={() => setHidePendingTxPopupPermanently(true)}
      onClose={() => setShowFollowPendingTxPopup(false)}
    >
      {children}
    </FollowPendingTxPopupUI>
  )
}

export default FollowPendingTxPopup

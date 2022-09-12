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

interface AddedOrder extends Order {
  addedTime: number
}

function isAnOrder(element: TransactionAndOrder): element is AddedOrder {
  return 'inputToken' in element && 'outputToken' in element
}

export const useLastPendingOrderId = (): AddedOrder | undefined => {
  const allRecentActivity = useRecentActivity()
  const lastPendingOrder = useMemo(() => {
    const pendings = allRecentActivity.filter(isPending)
    const lastOrder = pendings[pendings.length - 1]

    return (isAnOrder(lastOrder) && lastOrder) || undefined
  }, [allRecentActivity])

  return lastPendingOrder
}

const FollowPendingTxPopup: React.FC = ({ children }): JSX.Element => {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setHidePendingTxPopupPermanently = useUpdateAtom(handleHidePopupPermanentlyAtom)
  const isExpertMode = useIsExpertMode()
  const lastPendingOrder = useLastPendingOrderId()
  const showFollowPendingTxPopup = useAtomValue(showFollowTxPopupAtom())

  useEffect(() => {
    if (isExpertMode && lastPendingOrder) {
      setShowFollowPendingTxPopup(true)
    }
  }, [isExpertMode, lastPendingOrder, setShowFollowPendingTxPopup])

  return (
    <FollowPendingTxPopupUI
      show={showFollowPendingTxPopup}
      onCheck={() => setHidePendingTxPopupPermanently(true)}
      onClose={() => lastPendingOrder && setShowFollowPendingTxPopup(false)}
    >
      {children}
    </FollowPendingTxPopupUI>
  )
}

export default FollowPendingTxPopup

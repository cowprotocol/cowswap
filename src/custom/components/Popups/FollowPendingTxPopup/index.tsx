import React from 'react'
import {
  useUpdateAtom,
  useAtomValue,
  handleFollowPendingTxPopupAtom,
  handleHidePopupPermanentlyAtom,
  showFollowTxPopupAtom,
} from 'state/application/atoms'
import FollowPendingTxPopupUI from './FollowPendingTxPopupUI'

const FollowPendingTxPopup: React.FC = ({ children }): JSX.Element => {
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const setHidePendingTxPopupPermanently = useUpdateAtom(handleHidePopupPermanentlyAtom)
  const showFollowPendingTxPopup = useAtomValue(showFollowTxPopupAtom)

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

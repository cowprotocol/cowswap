import { atom } from 'jotai'
import { atomWithStorage, useUpdateAtom, useAtomValue, selectAtom } from 'jotai/utils'

import { OrderID } from 'api/gnosisProtocol'

export { useUpdateAtom, useAtomValue, selectAtom }

type FollowPendingTxPopup = {
  showPopup: boolean
  lastOrderPopupClosed: OrderID | undefined
  hidePopupPermanently: boolean
}

/**
 * Base atom that store the popup state that indicate how to follow a pending tx
 */
export const followPendingTxPopupAtom = atomWithStorage<FollowPendingTxPopup>('followPendingTxPopup', {
  showPopup: false,
  lastOrderPopupClosed: undefined,
  hidePopupPermanently: false,
})

export const handleFollowPendingTxPopupAtom = atom(null, (_get, set, showPopup: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, showPopup }))
})

export const handleHidePopupPermanentlyAtom = atom(null, (_get, set, hidePopupPermanently: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, hidePopupPermanently }))
})

export const handleCloseOrderPopupAtom = atom(null, (_get, set, orderIdClosed: OrderID) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, lastOrderPopupClosed: orderIdClosed }))
})

export const showFollowTxPopupAtom = selectAtom(
  followPendingTxPopupAtom,
  ({ showPopup, hidePopupPermanently }) => showPopup && !hidePopupPermanently
)

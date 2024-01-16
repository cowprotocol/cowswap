import { atom } from 'jotai'
import { atomWithStorage, selectAtom } from 'jotai/utils'

type FollowPendingTxPopup = {
  showPopup: boolean
  lastOrderPopupClosed: string | undefined
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

export const handleCloseOrderPopupAtom = atom(null, (_get, set, orderIdClosed: string) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, lastOrderPopupClosed: orderIdClosed }))
})

export const showFollowTxPopupAtom = selectAtom(
  followPendingTxPopupAtom,
  ({ showPopup, hidePopupPermanently }) => showPopup && !hidePopupPermanently
)

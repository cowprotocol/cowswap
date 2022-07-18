import { atom } from 'jotai'
import { atomWithStorage, useUpdateAtom, useAtomValue, selectAtom } from 'jotai/utils'

export { useUpdateAtom, useAtomValue, selectAtom }

type FollowPendingTxPopup = {
  showPopup: boolean
  hidePopupPermanently: boolean
}

/**
 * Base atom that store the popup state that indicate how to follow a pending tx
 */
export const followPendingTxPopupAtom = atomWithStorage<FollowPendingTxPopup>('followPendingTxPopup', {
  hidePopupPermanently: false,
  showPopup: false,
})

export const handleFollowPendingTxPopupAtom = atom(null, (_get, set, showPopup: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, showPopup }))
})

export const handleHidePopupPermanentlyAtom = atom(null, (_get, set, hidePopupPermanently: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, hidePopupPermanently }))
})

export const showFollowTxPopupAtom = selectAtom(
  followPendingTxPopupAtom,
  ({ showPopup, hidePopupPermanently }) => showPopup && !hidePopupPermanently
)

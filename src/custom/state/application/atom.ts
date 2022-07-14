import { atom } from 'jotai'
import { atomWithStorage, useUpdateAtom, useAtomValue, selectAtom } from 'jotai/utils'

export { useUpdateAtom, useAtomValue, selectAtom }

type FollowPendingTxPopup = {
  showPopup: boolean
  hideFollowTxPopup: boolean
}

/**
 * Base atom that store the popup state that indicate how to follow a pending tx
 */
export const followPendingTxPopupAtom = atomWithStorage<FollowPendingTxPopup>('followPendingTxPopup', {
  hideFollowTxPopup: false,
  showPopup: false,
})

export const handleFollowPendingTxPopupAtom = atom(null, (_get, set, showPopup: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, showPopup }))
})

export const handleHidePopupPermanentlyAtom = atom(null, (_get, set, hidePopup: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, hideFollowTxPopup: hidePopup }))
})

export const showFollowTxPopupAtom = selectAtom(
  followPendingTxPopupAtom,
  ({ showPopup, hideFollowTxPopup }) => showPopup && !hideFollowTxPopup
)

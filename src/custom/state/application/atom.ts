import { atom } from 'jotai'
import { atomWithStorage, useUpdateAtom, useAtomValue } from 'jotai/utils'

export { useUpdateAtom, useAtomValue }

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

export const handleFollowPendingTxPopupAtom = atom(null, (_get, set, update: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, showPopup: update }))
})

export const handleHidePopupPermanentlyAtom = atom(null, (_get, set, update: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, hideFollowTxPopup: update }))
})

export const showFollowTxPopupAtom = atom(
  (get) => get(followPendingTxPopupAtom).showPopup === true && !get(followPendingTxPopupAtom).hideFollowTxPopup
)

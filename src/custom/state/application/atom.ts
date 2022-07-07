import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

type FollowPendingTxPopup = {
  showPopup: boolean
  hideFollowTxPopup: boolean
}

/**
 * Base atom that store the modal that allow to follow a pending tx
 */
export const followPendingTxPopupAtom = atomWithStorage<FollowPendingTxPopup>('followPendingTxPopup', {
  hideFollowTxPopup: false,
  showPopup: false,
})

export const handleFollowPendingTxPopupAtom = atom(null, (_get, set, update: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, showPopup: update }))
})

export const showFollowTxPopupAtom = atom((get) => get(followPendingTxPopupAtom).showPopup === true)

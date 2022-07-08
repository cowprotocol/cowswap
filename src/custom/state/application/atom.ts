import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

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

export const handleHidePopupPermanentlyAtom = atom(null, (_get, set, update: boolean) => {
  set(followPendingTxPopupAtom, (prev) => ({ ...prev, hideFollowTxPopup: update }))
})

export const showFollowTxPopupAtom = atom(
  (get) => get(followPendingTxPopupAtom).showPopup === true && !get(followPendingTxPopupAtom).hideFollowTxPopup
)

export const useFollowPendingTxPopup = () => {
  const [, _setFollowPendingPopup] = useAtom(handleFollowPendingTxPopupAtom)
  const [, _setHidePopup] = useAtom(handleHidePopupPermanentlyAtom)
  const [_showFollowPendingTxPopup] = useAtom(showFollowTxPopupAtom)

  const setShowFollowPendingTxPopup = useCallback(
    (showPopup: boolean) => {
      _setFollowPendingPopup(showPopup)
    },
    [_setFollowPendingPopup]
  )

  const setHidePendingTxPopupPermanently = useCallback(
    (hidePopup: boolean) => {
      _setHidePopup(hidePopup)
    },
    [_setHidePopup]
  )

  return {
    showFollowPendingTxPopup: _showFollowPendingTxPopup,
    setShowFollowPendingTxPopup,
    setHidePendingTxPopupPermanently,
  }
}

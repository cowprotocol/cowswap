import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

type TxSubmittedModal = {
  isTxModalOpen?: boolean
  hideFollowTxPopup: boolean
}

/**
 * Base atom that store the modal that allow to follow a pending tx
 */
export const txSubmittedModalAtom = atomWithStorage<TxSubmittedModal>('txSubmittedModal', { hideFollowTxPopup: false })

export const handleOpenModalAtom = atom(null, (_get, set, isOpen: boolean) => {
  set(txSubmittedModalAtom, (prev) => ({ ...prev, isTxModalOpen: isOpen }))
})

export const showFollowTxPopupAtom = atom((get) => get(txSubmittedModalAtom).isTxModalOpen === false)

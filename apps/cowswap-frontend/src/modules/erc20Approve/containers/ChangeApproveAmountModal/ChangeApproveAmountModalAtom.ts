import { atom } from 'jotai/index'

export interface ChangeApproveModalState {
  isModalOpen: boolean
}

export const changeApproveAmountModalAtom = atom<ChangeApproveModalState>({
  isModalOpen: false,
})

export const updateChangeApproveAmountModalAtom = atom(
  null,
  (get, set, nextState: Partial<ChangeApproveModalState>) => {
    set(changeApproveAmountModalAtom, () => {
      const prevState = get(changeApproveAmountModalAtom)

      return { ...prevState, ...nextState }
    })
  },
)

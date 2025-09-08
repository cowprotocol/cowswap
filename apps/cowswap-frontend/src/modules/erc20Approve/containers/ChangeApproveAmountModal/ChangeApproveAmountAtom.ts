import { atom } from 'jotai/index'

export interface ChangeTradeApproveState {
  inProgress: boolean
  amount?: bigint
}

export const changeApproveAmountAtom = atom<ChangeTradeApproveState>({
  inProgress: false,
})

export const updateChangeApproveAmountStateAtom = atom(
  null,
  (get, set, nextState: Partial<ChangeTradeApproveState>) => {
    set(changeApproveAmountAtom, () => {
      const prevState = get(changeApproveAmountAtom)

      return { ...prevState, ...nextState }
    })
  },
)

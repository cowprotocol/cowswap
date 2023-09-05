import { atom } from 'jotai'

export interface AccountSelectorModalState {
  isOpen: boolean
}

export const accountSelectorModalAtom = atom<AccountSelectorModalState>({ isOpen: false })

export const toggleAccountSelectorModalAtom = atom(null, (get, set) => {
  set(accountSelectorModalAtom, { isOpen: !get(accountSelectorModalAtom).isOpen })
})

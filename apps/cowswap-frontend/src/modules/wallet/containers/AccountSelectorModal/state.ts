import { atom } from 'jotai'

export const accountSelectorModalAtom = atom<{ isOpen: boolean }>({ isOpen: false })

export const toggleAccountSelectorModalAtom = atom(null, (get, set) => {
  const current = get(accountSelectorModalAtom)
  set(accountSelectorModalAtom, { isOpen: !current.isOpen })
})

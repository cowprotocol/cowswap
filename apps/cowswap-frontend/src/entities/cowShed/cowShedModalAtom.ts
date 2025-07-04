import { atom } from 'jotai'

export interface CowShedModalState {
  isOpen: boolean
}

export const cowShedModalAtom = atom<CowShedModalState>({ isOpen: false })

import { atom } from 'jotai'

interface WrapNativeState {
  isOpen: boolean
}

export const wrapNativeStateAtom = atom<WrapNativeState>({
  isOpen: false,
})

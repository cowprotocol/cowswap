import { atom } from 'jotai'

interface WrapNativeState {
  isOpen: boolean
  errorMessage?: string
}

export const wrapNativeStateAtom = atom<WrapNativeState>({
  isOpen: false,
})

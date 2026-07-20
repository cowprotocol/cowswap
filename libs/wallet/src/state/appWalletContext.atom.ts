import { atom } from 'jotai'

export interface AppWalletContext {
  standaloneMode: boolean | undefined
}

export const appWalletContextAtom = atom<AppWalletContext | null>(null)

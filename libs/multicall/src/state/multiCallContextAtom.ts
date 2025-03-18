import { atom } from 'jotai'

export interface MultiCallContext {
  chainId: number
}

export const multiCallContextAtom = atom<MultiCallContext | null>(null)

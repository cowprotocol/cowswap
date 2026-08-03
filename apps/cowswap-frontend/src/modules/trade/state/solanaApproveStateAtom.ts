import { atom } from 'jotai'

export interface SolanaApproveState {
  isOpen: boolean
  errorMessage?: string
  /** Symbol of the token being approved, shown on the pending screen. */
  tokenSymbol?: string
}

export const solanaApproveStateAtom = atom<SolanaApproveState>({ isOpen: false })

import { atom } from 'jotai'

export interface SolanaSigningDeadlineState {
  /** Epoch ms after which the transaction's blockhash is expected to be dead. */
  expiresAt: number
  /** Full window length in ms, kept so the UI can render remaining/total progress. */
  durationMs: number
}

export const solanaSigningDeadlineAtom = atom<SolanaSigningDeadlineState | null>(null)

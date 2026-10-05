import { atom } from 'jotai'

export interface SolanaSigningDeadlineState {
  /** Epoch ms after which the transaction's blockhash is expected to be dead. */
  expiresAt: number
  /** Full window length in ms, kept so the UI can render remaining/total progress. */
  durationMs: number
}

export const solanaSigningDeadlineAtom = atom<SolanaSigningDeadlineState | null>(null)

/**
 * Set when the signing window closed under a still-open wallet prompt (which cannot be cancelled
 * programmatically): routes the prompt's eventual rejection back to the review screen.
 */
export const solanaSigningAbandonedAtom = atom(false)

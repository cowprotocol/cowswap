import { atom } from 'jotai'

export interface SolanaSigningDeadlineState {
  /** Epoch ms after which the transaction's blockhash is expected to be dead. */
  expiresAt: number
  /** Full window length in ms, kept so the UI can render remaining/total progress. */
  durationMs: number
}

export const solanaSigningDeadlineAtom = atom<SolanaSigningDeadlineState | null>(null)

/**
 * Set when the signing window closed under a still-open wallet prompt: either the user left the
 * expired signing screen for the review screen, or the wallet answered after `expiresAt`. The flow
 * cannot cancel the prompt programmatically, so its error handling reads this flag to route the
 * eventual rejection back to the review screen instead of the error modal.
 */
export const solanaSigningAbandonedAtom = atom(false)

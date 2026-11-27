import { atom } from 'jotai'

import { TradeAmounts } from 'common/types'

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

/**
 * Amounts of the attempt the wallet signed too late, or null when the last failure was anything
 * else: the confirm state drops its own amounts the moment an error is set, and which error it was
 * is no longer visible from there either.
 */
export const solanaSigningWindowExpiredAtom = atom<TradeAmounts | null>(null)

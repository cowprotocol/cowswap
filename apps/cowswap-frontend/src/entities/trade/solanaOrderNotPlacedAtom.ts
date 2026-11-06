import { atom } from 'jotai'

import { TradeAmounts } from 'common/types'

export interface SolanaOrderNotPlacedState {
  tradeAmounts: TradeAmounts
  /** The failure as the user-facing layer phrased it, shown under "technical details". */
  errorMessage: string
  /** Program logs when the failure carried any — a wallet-level error usually does not. */
  logs: string[] | null
}

/**
 * Set only for a failure that is known to have happened before the transaction was handed over:
 * the screen it drives states outright that nothing was submitted, which a failure after the
 * hand-over cannot promise.
 */
export const solanaOrderNotPlacedAtom = atom<SolanaOrderNotPlacedState | null>(null)

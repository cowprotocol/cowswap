import { atom } from 'jotai'

import { TradeAmounts } from 'common/types'

export interface SolanaOrderNotPlacedState {
  tradeAmounts: TradeAmounts
  /** The failure as the user-facing layer phrased it, shown under "technical details". */
  errorMessage: string
  /** Program logs when the failure carried any — a wallet-level error usually does not. */
  logs: string[] | null
  /**
   * The SquadsX extension is not an active proposer on the Squad, which is a setup step the user
   * has to complete in Squads — so the screen explains that instead of blaming the transaction.
   */
  isSquadsSetupRequired: boolean
}

/**
 * Set only for a failure that is known to have happened before the transaction was handed over:
 * the screen it drives states outright that nothing was submitted, which a failure after the
 * hand-over cannot promise.
 */
export const solanaOrderNotPlacedAtom = atom<SolanaOrderNotPlacedState | null>(null)

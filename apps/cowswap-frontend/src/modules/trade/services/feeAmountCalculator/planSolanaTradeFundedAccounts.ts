import { PublicKey } from '@solana/web3.js'

import { BuyAtaQuote, getCreateBuyAtaFundedAccounts } from '../solanaFlow/planCreateBuyAtaStep'
import { getCreateOrderFundedAccounts } from '../solanaFlow/planCreateOrderStep'
import { getWrapFundedAccounts } from '../solanaFlow/planWrapStep'
import { SolanaFundedAccount } from '../solanaFlow/types'

export interface PlanSolanaTradeFundedAccountsParams {
  owner: PublicKey
  quote: BuyAtaQuote
  isNativeSell: boolean
}

/**
 * Accounts a trade's bundle creates, read from the same per-step declarations the flow itself uses.
 *
 * Exists because the trade form has to price the bundle before it can be built: `planCreateOrderStep`
 * signs its order through the SDK, far too heavy to run on every keystroke. The conditions here mirror
 * the step list in `solanaFlow` — the delegate step is absent because it creates nothing.
 */
export function planSolanaTradeFundedAccounts({
  owner,
  quote,
  isNativeSell,
}: PlanSolanaTradeFundedAccountsParams): SolanaFundedAccount[] {
  return [
    ...(isNativeSell ? getWrapFundedAccounts(owner) : []),
    ...getCreateBuyAtaFundedAccounts(quote),
    ...getCreateOrderFundedAccounts(),
  ]
}

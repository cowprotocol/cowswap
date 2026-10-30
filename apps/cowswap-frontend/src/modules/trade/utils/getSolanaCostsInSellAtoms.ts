import { isSellOrder } from '@cowprotocol/common-utils'
import type { OrderParameters, SolanaQuoteCosts } from '@cowprotocol/cow-sdk'

import { getSolanaCostAtoms } from './getSolanaCostAtoms'
import { positiveIntegerAtom } from './positiveIntegerAtom'

/**
 * The costs a Solana quote netted out of its amounts, in atoms of the sell token.
 *
 * A Solana quote reports `feeAmount: "0"` and settles its costs inside the amounts instead, so the
 * sell-denominated fee every other chain gets from `feeAmount` has to be derived here.
 *
 * A buy order's costs are already taken from the sell side. A sell order's come off the buy side, so
 * they convert at the quote's own rate before costs: `sellAmount` buys `buyAmount + costs`, which
 * makes each cost atom worth `sellAmount / (buyAmount + costs)` of the sell token.
 */
export function getSolanaCostsInSellAtoms(orderParams: OrderParameters, costs: SolanaQuoteCosts | undefined): bigint {
  if (!costs) return 0n

  const { total } = getSolanaCostAtoms(costs)

  if (total === 0n || !isSellOrder(orderParams.kind)) return total

  const sellAmount = positiveIntegerAtom(orderParams.sellAmount)
  const buyAmount = positiveIntegerAtom(orderParams.buyAmount)

  // Without both sides there is no rate to convert the buy-side costs at, and guessing one would
  // charge the whole sell amount as a fee.
  if (!sellAmount || !buyAmount) return 0n

  return (total * sellAmount) / (buyAmount + total)
}

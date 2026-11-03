import type { OrderParameters } from '@cowprotocol/cow-sdk'

import { positiveIntegerAtom } from './positiveIntegerAtom'

/**
 * Whether the quote reports its execution cost the EVM way: `feeAmount` in the sell token, with
 * `sellAmount` net of it.
 *
 * Solana answered `feeAmount: "0"` and settled the cost inside the amounts instead, until
 * https://github.com/cowprotocol/services/pull/5214. Both shapes are in flight, and the quote is its own
 * discriminator, so neither side needs the other's deploy.
 */
export function reportsFeeInSellToken(orderParams: OrderParameters): boolean {
  return (positiveIntegerAtom(orderParams.feeAmount) ?? 0n) > 0n
}

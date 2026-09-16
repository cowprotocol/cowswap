import type { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { isMaxAmountToApprove } from 'modules/erc20Approve'
import { SOLANA_MAX_APPROVE_AMOUNT } from 'modules/trade'

/**
 * How much to delegate in the bundled trade transaction, from the partial/full approval switcher.
 *
 * `useGetAmountToSignApprove` returns EVM's `maxUint256` sentinel for an unlimited approval, which does
 * not fit SPL's u64 amount — swap it for the SPL equivalent rather than passing it through.
 */
export function getSolanaDelegationAmount(
  amountToApprove: CurrencyAmount<Currency> | null,
  sellAmount: bigint,
): bigint {
  if (!amountToApprove) return sellAmount

  if (isMaxAmountToApprove(amountToApprove)) return SOLANA_MAX_APPROVE_AMOUNT

  return BigInt(amountToApprove.quotient.toString())
}

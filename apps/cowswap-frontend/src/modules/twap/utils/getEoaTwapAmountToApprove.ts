import { maxUint256 } from 'viem'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { isMaxAmountToApprove } from 'modules/erc20Approve'

/**
 * Resolves the amount to approve for the EOA TWAP funding leg.
 *
 * When the user hasn't opted into partial approvals, keeps the existing unlimited approve.
 * Otherwise approves the larger of the user's selected amount and `amountToCover` (the TWAP sell
 * plus buffer, see {@link getEoaTwapPrePlacementAmountToCover}) — the buffer exists because the
 * funding order's exact size is only known after the quote inside `placeEoaTwapOrder`, so a partial
 * approve below it risks a second on-chain approval prompt mid-flow.
 */
export function getEoaTwapAmountToApprove(
  amountToSignApprove: Nullish<CurrencyAmount<Currency>>,
  amountToCover: bigint,
): bigint {
  if (!amountToSignApprove || isMaxAmountToApprove(amountToSignApprove)) {
    return maxUint256
  }

  const selectedAmount = BigInt(amountToSignApprove.quotient.toString())

  return selectedAmount > amountToCover ? selectedAmount : amountToCover
}

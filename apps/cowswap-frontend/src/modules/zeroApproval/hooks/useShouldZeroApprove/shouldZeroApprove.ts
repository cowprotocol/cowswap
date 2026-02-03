import { Erc20 } from '@cowprotocol/cowswap-abis'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ApprovalState } from 'modules/erc20Approve'

interface ShouldZeroApproveParams {
  tokenContract: Nullish<Erc20>
  spender: Nullish<string>
  amountToApprove: Nullish<CurrencyAmount<Currency>>
  forceApprove?: boolean
  approvalState?: ApprovalState
}

export async function shouldZeroApprove({
  approvalState,
  tokenContract,
  spender,
  amountToApprove,
  forceApprove,
}: ShouldZeroApproveParams): Promise<boolean | null> {
  const shouldApprove =
    forceApprove || approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING

  if (!tokenContract || !spender || !amountToApprove || !shouldApprove) {
    return null
  }

  try {
    // Check if the trade is possible via estimating gas.
    await tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())

    return false
  } catch {
    try {
      // Check for the trade has failed. Check if a trade with 0 amount is possible.
      // If it is, then we need to first reset the allowance to 0.
      await tokenContract.estimateGas.approve(spender, '0')

      return true
    } catch {
      // If the trade with 0 amount is also not possible, we have an actual error case.
      // We can't do anything about it, so we just return false.
      return false
    }
  }
}

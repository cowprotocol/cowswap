import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'
import { encodeFunctionData, erc20Abi } from 'viem'
import { Config } from 'wagmi'
import { estimateGas } from 'wagmi/actions'

import { ApprovalState } from 'modules/erc20Approve'

interface ShouldZeroApproveParams {
  tokenAddress: Nullish<string>
  spender: Nullish<string>
  amountToApprove: Nullish<CurrencyAmount<Currency>>
  forceApprove?: boolean
  approvalState?: ApprovalState
  config: Config
}

export async function shouldZeroApprove({
  approvalState,
  tokenAddress,
  spender,
  amountToApprove,
  forceApprove,
  config,
}: ShouldZeroApproveParams): Promise<boolean | null> {
  const shouldApprove =
    forceApprove || approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING

  if (!tokenAddress || !spender || !amountToApprove || !shouldApprove) {
    return null
  }

  const amountBigInt = BigInt(amountToApprove.quotient.toString())

  try {
    // Check if the trade is possible via estimating gas.
    await estimateGas(config, {
      to: tokenAddress,
      data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender, amountBigInt] }),
    })

    return false
  } catch {
    try {
      // Check for the trade has failed. Check if a trade with 0 amount is possible.
      // If it is, then we need to first reset the allowance to 0.
      await estimateGas(config, {
        to: tokenAddress,
        data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender, 0n] }),
      })

      return true
    } catch {
      // If the trade with 0 amount is also not possible, we have an actual error case.
      // We can't do anything about it, so we just return false.
      return false
    }
  }
}

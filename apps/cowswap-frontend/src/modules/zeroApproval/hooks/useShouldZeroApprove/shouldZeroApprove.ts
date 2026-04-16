import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'
import { erc20Abi } from 'viem'
import { simulateContract } from 'wagmi/actions'

import { ApprovalState } from 'modules/erc20Approve'

import type { Config } from 'wagmi'

export interface ShouldZeroApproveParams {
  tokenAddress: Nullish<string>
  spender: Nullish<string>
  amountToApprove: Nullish<CurrencyAmount<Currency>>
  forceApprove?: boolean
  approvalState?: ApprovalState
  config: Nullish<Config>
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

  if (!tokenAddress || !spender || !amountToApprove || !shouldApprove || !config) {
    return null
  }

  try {
    await simulateContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as `0x${string}`, BigInt(amountToApprove.quotient.toString())],
    })
    return false
  } catch {
    try {
      await simulateContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, 0n],
      })
      return true
    } catch {
      return false
    }
  }
}

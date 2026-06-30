import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'
import { Address, BaseError } from 'viem'
import { simulateContract } from 'wagmi/actions'

import { ApprovalState } from 'modules/erc20Approve'

import type { Config } from 'wagmi'

// viem errors are multi-line `BaseError`s; logging the whole object floods the console with a
// scary stack + docs links. We only need the one-line reason here.
function getSimulationErrorReason(e: unknown): string {
  return e instanceof BaseError ? e.shortMessage : String(e)
}

const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'spender',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    // It's important to keep it empty
    // Viem validates the output and USDT output is not a standard ERC-20 type (bool expected)
    outputs: [],
  },
]

export interface ShouldZeroApproveParams {
  tokenAddress: Nullish<Address>
  spender: Nullish<Address>
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
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, BigInt(amountToApprove.quotient.toString())],
    })

    return false
  } catch (e) {
    // Approving a non-zero amount over an existing non-zero allowance reverts for USDT-style tokens
    // that require resetting the allowance to zero first. This is expected and is exactly how we
    // detect that a zero-approval is needed, so keep it as a quiet debug breadcrumb.
    console.debug('shouldZeroApprove: approve simulation reverted, checking zero-approval', getSimulationErrorReason(e))
    try {
      await simulateContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, 0n],
      })
      return true
    } catch (e) {
      // The zero-amount approval also reverted, so we can't determine the allowance behaviour.
      console.warn('shouldZeroApprove: zero-amount approve simulation reverted', getSimulationErrorReason(e))
      return false
    }
  }
}

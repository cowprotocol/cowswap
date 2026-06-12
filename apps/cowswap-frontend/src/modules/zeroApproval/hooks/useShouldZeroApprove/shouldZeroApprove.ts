import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'
import { Address } from 'viem'
import { simulateContract } from 'wagmi/actions'

import { ApprovalState } from 'modules/erc20Approve'

import type { Config } from 'wagmi'

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
    console.error('shouldZeroApprove #1 error', e)
    try {
      await simulateContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, 0n],
      })
      return true
    } catch (e) {
      console.error('shouldZeroApprove #2 error', e)
      return false
    }
  }
}

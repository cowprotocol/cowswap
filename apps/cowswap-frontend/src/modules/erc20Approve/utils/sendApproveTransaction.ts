import { type Address, erc20Abi, type PublicClient } from 'viem'

import { calculateGasMargin } from '@cowprotocol/common-utils'
import { EvmChains } from '@cowprotocol/cow-sdk'

import { estimateApprove } from './estimateApprove'

export interface ApproveWriteContractParams {
  address: Address
  abi: typeof erc20Abi
  functionName: 'approve'
  args: readonly [Address, bigint]
  gas: bigint
  account: Address
}

export interface SendApproveTransactionParams {
  publicClient: PublicClient
  tokenAddress: Address
  spender: string
  amount: bigint
  account: Address
  chainId: EvmChains
  writeContract: (params: ApproveWriteContractParams) => Promise<`0x${string}`>
}

/**
 * Estimates gas and submits an ERC-20 `approve` via the provided write function.
 * Callers inject wallet-client or wagmi-config write so this stays UI/service-agnostic.
 */
export async function sendApproveTransaction({
  publicClient,
  tokenAddress,
  spender,
  amount,
  account,
  chainId,
  writeContract,
}: SendApproveTransactionParams): Promise<`0x${string}`> {
  const estimation = await estimateApprove(publicClient, tokenAddress, spender, amount, account, chainId)

  return writeContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender as Address, amount],
    gas: calculateGasMargin(estimation.gasLimit),
    account,
  })
}

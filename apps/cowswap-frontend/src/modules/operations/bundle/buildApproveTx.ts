import { erc20Abi, encodeFunctionData, type TransactionRequest } from 'viem'

export type BuildApproveTxParams = {
  tokenAddress: string
  spender: string
  amountToApprove: bigint
}

/**
 * Builds the approval tx, without sending it
 */
export async function buildApproveTx(params: BuildApproveTxParams): Promise<TransactionRequest> {
  const { tokenAddress, spender, amountToApprove } = params

  return {
    to: tokenAddress,
    data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender, amountToApprove] }),
  }
}

import { encodeFunctionData, type TransactionRequest } from 'viem'

import type { WethContractData } from 'common/hooks/useContract'

export type BuildWrapTxParams = {
  wrappedNativeContract: WethContractData
  weiAmount: string
}

/**
 * Builds the wrap (deposit) tx for native token -> WETH, without sending it
 */
export function buildWrapTx(params: BuildWrapTxParams): TransactionRequest {
  const { wrappedNativeContract, weiAmount } = params
  const value = BigInt(weiAmount)
  return {
    to: wrappedNativeContract.address as `0x${string}`,
    data: encodeFunctionData({
      abi: wrappedNativeContract.abi,
      functionName: 'deposit',
    }),
    value,
  }
}

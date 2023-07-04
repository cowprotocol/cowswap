import { Weth } from '@cowprotocol/abis'

export type BuildWrapTxParams = {
  wrappedNativeContract: Weth
  weiAmount: string
}

/**
 * Builds a wrap tx for the given order, without sending it
 */
export async function buildWrapTx({ wrappedNativeContract, weiAmount }: BuildWrapTxParams) {
  return wrappedNativeContract.populateTransaction.deposit({ value: weiAmount })
}

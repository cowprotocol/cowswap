import { Weth } from '@cowprotocol/abis'

export type BuildWrapTxParams = {
  wrappedNativeContract: Weth
  weiAmount: string
}

/**
 * Builds a wrap tx for the given order, without sending it
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function buildWrapTx({ wrappedNativeContract, weiAmount }: BuildWrapTxParams) {
  return wrappedNativeContract.populateTransaction.deposit({ value: weiAmount })
}

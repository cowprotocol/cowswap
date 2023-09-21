import { GPv2Settlement } from '@cowprotocol/abis'

export type BuildPresignTxParams = {
  orderId: string
  settlementContract: GPv2Settlement
}

/**
 * Builds a presign tx for the given order, without sending it
 */
export async function buildPresignTx({ orderId, settlementContract }: BuildPresignTxParams) {
  return settlementContract.populateTransaction.setPreSignature(orderId, true)
}

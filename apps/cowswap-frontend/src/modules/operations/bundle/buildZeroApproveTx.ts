import type { TransactionRequest } from 'viem'

import { buildApproveTx, BuildApproveTxParams } from './buildApproveTx'

type BuildZeroApproveTxParams = Omit<BuildApproveTxParams, 'amountToApprove'>

/**
 * Builds the zero approval tx, without sending it.
 */
export async function buildZeroApproveTx({ ...params }: BuildZeroApproveTxParams): Promise<TransactionRequest> {
  return buildApproveTx({
    ...params,
    amountToApprove: 0n,
  })
}

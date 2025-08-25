import { PopulatedTransaction } from '@ethersproject/contracts'

import { buildApproveTx, BuildApproveTxParams } from './buildApproveTx'

type BuildZeroApproveTxParams = Omit<BuildApproveTxParams, 'amountToApprove'>

/**
 * Builds the zero approval tx, without sending it.
 */
export async function buildZeroApproveTx({ ...params }: BuildZeroApproveTxParams): Promise<PopulatedTransaction> {
  return buildApproveTx({
    ...params,
    amountToApprove: 0n,
  })
}

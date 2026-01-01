import { Erc20 } from '@cowprotocol/cowswap-abis'
import { PopulatedTransaction } from '@ethersproject/contracts'

import { estimateApprove } from 'modules/erc20Approve'

export type BuildApproveTxParams = {
  erc20Contract: Erc20
  spender: string
  amountToApprove: bigint
}

/**
 * Builds the approval tx, without sending it
 */
export async function buildApproveTx(params: BuildApproveTxParams): Promise<PopulatedTransaction> {
  const { erc20Contract, spender, amountToApprove } = params
  const estimatedAmount = await estimateApprove(erc20Contract, spender, amountToApprove)
  return erc20Contract.populateTransaction.approve(spender, estimatedAmount.approveAmount)
}

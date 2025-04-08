import { Erc20 } from '@cowprotocol/abis'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { estimateApprove } from 'modules/erc20Approval'

export type BuildApproveTxParams = {
  erc20Contract: Erc20
  spender: string
  amountToApprove: CurrencyAmount<Currency>
}

/**
 * Builds the approval tx, without sending it
 */
export async function buildApproveTx(params: BuildApproveTxParams) {
  const { erc20Contract, spender, amountToApprove } = params

  const estimatedAmount = await estimateApprove(erc20Contract, spender, BigInt(amountToApprove.quotient.toString()))

  return erc20Contract.populateTransaction.approve(spender, estimatedAmount.approveAmount)
}

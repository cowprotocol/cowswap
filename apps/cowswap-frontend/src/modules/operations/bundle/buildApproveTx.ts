import { Erc20 } from '@cowprotocol/abis'
import { PopulatedTransaction } from '@ethersproject/contracts'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { estimateApprove } from '../../erc20Approve/hooks/useApproveCallback'

export type BuildApproveTxParams = {
  erc20Contract: Erc20
  spender: string
  amountToApprove: CurrencyAmount<Currency>
}

/**
 * Builds the approval tx, without sending it
 */
export async function buildApproveTx(params: BuildApproveTxParams): Promise<PopulatedTransaction> {
  const { erc20Contract, spender, amountToApprove } = params

  const toApprove = BigInt(amountToApprove.quotient.toString())
  const estimatedAmount = await estimateApprove(erc20Contract, spender, toApprove)

  return erc20Contract.populateTransaction.approve(spender, estimatedAmount.approveAmount)
}

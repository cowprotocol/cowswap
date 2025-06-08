import { Erc20 } from '@cowprotocol/abis'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { estimateApprove } from 'common/hooks/useApproveCallback'

export type BuildApproveTxParams = {
  erc20Contract: Erc20
  spender: string
  amountToApprove: CurrencyAmount<Currency>
}

/**
 * Builds the approval tx, without sending it
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function buildApproveTx(params: BuildApproveTxParams) {
  const { erc20Contract, spender, amountToApprove } = params

  const estimatedAmount = await estimateApprove(erc20Contract, spender, amountToApprove.quotient.toString())

  return erc20Contract.populateTransaction.approve(spender, estimatedAmount.approveAmount)
}

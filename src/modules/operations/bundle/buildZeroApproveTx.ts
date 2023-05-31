import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BuildApproveTxParams, buildApproveTx } from './buildApproveTx'

type BuildZeroApproveTxParams = Omit<BuildApproveTxParams, 'amountToApprove'> & {
  currency: Currency
}

/**
 * Builds the zero approval tx, without sending it.
 */
export async function buildZeroApproveTx({ currency, ...params }: BuildZeroApproveTxParams) {
  return buildApproveTx({
    ...params,
    amountToApprove: CurrencyAmount.fromRawAmount(currency, 0),
  })
}

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BuildApproveTxParams, buildApproveTx } from './buildApproveTx'

type BuildZeroApproveTxParams = Omit<BuildApproveTxParams, 'amountToApprove'> & {
  currency: Currency
}

/**
 * Builds the zero approval tx, without sending it.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function buildZeroApproveTx({ currency, ...params }: BuildZeroApproveTxParams) {
  return buildApproveTx({
    ...params,
    amountToApprove: CurrencyAmount.fromRawAmount(currency, 0),
  })
}

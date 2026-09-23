import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import type { ReceiveAmountInfo } from 'modules/trade'

/**
 * The sell amount the swap order is signed with, i.e. what the wallet balance has to cover.
 * Unlike `afterSlippage.sellAmount`, it includes the network costs of a sell order.
 */
export function getSwapMaximumSellAmount(
  receiveAmountInfo: Nullish<ReceiveAmountInfo>,
): CurrencyAmount<Currency> | null {
  return receiveAmountInfo?.amountsToSign.sellAmount ?? null
}

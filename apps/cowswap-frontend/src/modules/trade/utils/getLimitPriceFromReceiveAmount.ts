import { FractionUtils } from '@cowprotocol/common-utils'
import { Price, Currency } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from '../types'

export function getLimitPriceFromReceiveAmount({ afterNetworkCosts, afterSlippage }: ReceiveAmountInfo): Price<Currency, Currency> | null {

  const quoteAmount = FractionUtils.amountToAtLeastOneWei(afterSlippage.buyAmount)

  if (!quoteAmount) return null

  return new Price({
    quoteAmount,
    baseAmount: afterNetworkCosts.sellAmount,
  })
}

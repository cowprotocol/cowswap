import { Price, Currency } from '@cowprotocol/common-entities'
import { FractionUtils } from '@cowprotocol/common-utils'

import { ReceiveAmountInfo } from '../types'

export function getLimitPriceFromReceiveAmount({ amountsToSign }: ReceiveAmountInfo): Price<Currency, Currency> | null {
  const quoteAmount = FractionUtils.amountToAtLeastOneWei(amountsToSign.buyAmount)

  if (!quoteAmount) return null

  return new Price({
    quoteAmount,
    baseAmount: amountsToSign.sellAmount,
  })
}

import { FractionUtils, getCurrencyAddress } from '@cowprotocol/common-utils'

import { TWAPOrder, TWAPOrderStruct } from '../types'

export function twapOrderToStruct(order: TWAPOrder): TWAPOrderStruct {
  const buyToken = order.buyAmount.currency
  const minPartLimit = FractionUtils.amountToAtLeastOneWei(order.buyAmount.divide(order.numOfParts))

  return {
    sellToken: order.sellAmount.currency.address,
    buyToken: getCurrencyAddress(buyToken),
    receiver: order.receiver,
    partSellAmount: order.sellAmount.divide(order.numOfParts).quotient.toString(),
    minPartLimit: minPartLimit!.quotient.toString(),
    t0: order.startTime,
    n: order.numOfParts,
    t: order.timeInterval,
    span: order.span,
    appData: order.appData,
  }
}

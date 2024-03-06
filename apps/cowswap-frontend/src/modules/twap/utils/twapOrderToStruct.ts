import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { FractionUtils, getIsNativeToken } from '@cowprotocol/common-utils'

import { TWAPOrder, TWAPOrderStruct } from '../types'

export function twapOrderToStruct(order: TWAPOrder): TWAPOrderStruct {
  const buyToken = order.buyAmount.currency
  const minPartLimit = FractionUtils.amountToAtLeastOneWei(order.buyAmount.divide(order.numOfParts))

  return {
    sellToken: order.sellAmount.currency.address,
    buyToken: getIsNativeToken(buyToken) ? NATIVE_CURRENCY_ADDRESS : buyToken.address,
    receiver: order.receiver,
    partSellAmount: order.sellAmount.divide(order.numOfParts).quotient.toString(),
    minPartLimit: minPartLimit.quotient.toString(),
    t0: order.startTime,
    n: order.numOfParts,
    t: order.timeInterval,
    span: order.span,
    appData: order.appData,
  }
}

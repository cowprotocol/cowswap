import { TWAPOrder, TWAPOrderStruct } from '../types'

export function twapOrderToStruct(order: TWAPOrder): TWAPOrderStruct {
  return {
    sellToken: order.sellAmount.currency.address,
    buyToken: order.buyAmount.currency.address,
    receiver: order.receiver,
    partSellAmount: order.sellAmount.divide(order.numOfParts).quotient.toString(),
    minPartLimit: order.buyAmount.divide(order.numOfParts).quotient.toString(),
    t0: order.startTime,
    n: order.numOfParts,
    t: order.timeInterval,
    span: order.span,
  }
}

import { TWAPOrderStruct } from '../types'

export function isTwapOrderFulfilled(order: TWAPOrderStruct, executedSellAmount: string): boolean {
  return executedSellAmount === (BigInt(order.partSellAmount) * BigInt(order.n)).toString()
}

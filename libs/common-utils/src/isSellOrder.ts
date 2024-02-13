import { OrderKind } from '@cowprotocol/cow-sdk'

export function isSellOrder(kind: OrderKind): boolean {
  return kind === OrderKind.SELL
}

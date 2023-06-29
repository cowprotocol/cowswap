import { ComposableCowInfo } from 'common/types'

export function getIsComposableCowParentOrder(order: { composableCowInfo?: ComposableCowInfo }): boolean {
  return !!order.composableCowInfo?.id
}

import { ComposableCowInfo } from 'common/types'

export function getIsComposableCowChildOrder(order: { composableCowInfo?: ComposableCowInfo }): boolean {
  return !!order.composableCowInfo?.parentId
}

import { ComposableCowInfo } from 'common/types'

export function getIsComposableCowOrder(order: { composableCowInfo?: ComposableCowInfo }): boolean {
  return !!order.composableCowInfo?.id
}

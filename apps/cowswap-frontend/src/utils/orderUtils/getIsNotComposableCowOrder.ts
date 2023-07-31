import { ComposableCowInfo } from 'common/types'

export function getIsNotComposableCowOrder(order?: { composableCowInfo?: ComposableCowInfo }): boolean {
  return !order?.composableCowInfo
}

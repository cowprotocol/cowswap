import { ComposableCowInfo } from 'common/types'

export function getIsComposableCowDiscreteOrder(order?: { composableCowInfo?: ComposableCowInfo }): boolean {
  return order?.composableCowInfo?.isVirtualPart === false
}

import { ComposableCowInfo } from 'common/types'

export function getComposableCowParentId(order: { composableCowInfo?: ComposableCowInfo }): string | undefined {
  return order.composableCowInfo?.parentId
}

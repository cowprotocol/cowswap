import { getIsNotComposableCowOrder } from './getIsNotComposableCowOrder'

import { ComposableCowInfo } from '../../common/types'

const TWAP_ORDER_REGEX = /"orderClass":\s*"twap"/

export function getIsComposableCowOrder(order?: {
  composableCowInfo?: ComposableCowInfo
  fullAppData?: string | null
}): boolean {
  return (
    !getIsNotComposableCowOrder(order) || // this check only works for orders placed in the same device, thus orders loaded from the API will never have this
    TWAP_ORDER_REGEX.test(order?.fullAppData || '') // this check assumes the appData is correctly filled
  )
}

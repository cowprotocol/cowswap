import type { TwapStatus } from '@cowprotocol/sdk-composable'

import { TwapOrderStatus } from '../types'

const TWAP_STATUS: Record<TwapStatus, TwapOrderStatus> = {
  open: TwapOrderStatus.Pending,
  filled: TwapOrderStatus.Fulfilled,
  partiallyFilled: TwapOrderStatus.PartiallyFilled,
  expired: TwapOrderStatus.Expired,
  cancelled: TwapOrderStatus.Cancelled,
}

export function mapTwapStatus(status: TwapStatus): TwapOrderStatus {
  return TWAP_STATUS[status]
}

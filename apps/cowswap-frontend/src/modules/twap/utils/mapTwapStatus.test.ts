import type { TwapStatus } from '@cowprotocol/sdk-composable'

import { mapTwapStatus } from './mapTwapStatus'

import { TwapOrderStatus } from '../types'

it.each<[TwapStatus, TwapOrderStatus]>([
  ['open', TwapOrderStatus.Pending],
  ['filled', TwapOrderStatus.Fulfilled],
  ['partiallyFilled', TwapOrderStatus.PartiallyFilled],
  ['expired', TwapOrderStatus.Expired],
  ['cancelled', TwapOrderStatus.Cancelled],
])('maps SDK %s to the frontend status %s', (sdkStatus, frontendStatus) => {
  expect(mapTwapStatus(sdkStatus)).toBe(frontendStatus)
})

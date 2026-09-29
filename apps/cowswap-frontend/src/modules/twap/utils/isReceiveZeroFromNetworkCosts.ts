import { isFractionFalsy } from '@cowprotocol/common-utils'

import type { ReceiveAmountInfo } from 'modules/trade'

type ReceiveNetworkCosts = Pick<ReceiveAmountInfo, 'isSell' | 'beforeNetworkCosts' | 'afterNetworkCosts'>

/**
 * True when network costs wipe a positive quoted buy, so receive (incl. fees) is 0.
 * A missing quote stays false: both sides are empty, not consumed.
 */
export function isReceiveZeroFromNetworkCosts(info: ReceiveNetworkCosts | null): boolean {
  if (!info?.isSell) return false

  const quotedBuy = info.beforeNetworkCosts.buyAmount
  const buyAfterNetworkCosts = info.afterNetworkCosts.buyAmount

  return !isFractionFalsy(quotedBuy) && isFractionFalsy(buyAfterNetworkCosts)
}

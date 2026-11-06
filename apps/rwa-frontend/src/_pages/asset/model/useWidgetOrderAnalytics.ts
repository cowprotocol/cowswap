import { useMemo } from 'react'

import {
  mapCancelledOrder,
  mapExpiredOrder,
  mapFulfilledOrder,
  mapPostedOrder,
} from '@cowprotocol/analytics/order-lifecycle'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { type RwaAsset } from '@/entities/asset'
import { trackEvent } from '@/shared/lib/analytics'

/** Widget listeners that send the order lifecycle to GTM with the payloads CoW Swap sends, plus the asset ticker */
export function useWidgetOrderAnalytics(asset: RwaAsset): CowWidgetEventListeners {
  return useMemo(() => {
    const { ticker } = asset
    const isAssetToken = (chainId: number, address: string): boolean =>
      asset.tokens.some((token) => token.chainId === chainId && areAddressesEqual(token.address, address))

    return [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: (payload) => {
          trackEvent('order_submitted', {
            ...mapPostedOrder(payload),
            ticker,
            side: isAssetToken(payload.chainId, payload.outputToken.address) ? 'buy' : 'sell',
          })
        },
      },
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: (payload) => trackEvent('swap_executed', { ...mapFulfilledOrder(payload), ticker }),
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: (payload) => trackEvent('swap_cancelled', { ...mapCancelledOrder(payload), ticker }),
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: (payload) => trackEvent('swap_expired', { ...mapExpiredOrder(payload), ticker }),
      },
    ]
  }, [asset])
}

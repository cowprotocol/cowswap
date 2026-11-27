import { useMemo } from 'react'

import {
  mapCancelledOrder,
  mapExpiredOrder,
  mapFulfilledOrder,
  mapPostedOrder,
} from '@cowprotocol/analytics/order-lifecycle'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import {
  type BaseOrderPayload,
  type CowWidgetEventListeners,
  CowWidgetEvents,
  type OnFulfilledOrderPayload,
} from '@cowprotocol/events'

import { type RwaAsset } from '@/entities/asset'
import { trackEvent } from '@/shared/lib/analytics'

type OrderOutcomePayload = BaseOrderPayload & Pick<OnFulfilledOrderPayload, 'bridgeOrder'>

/**
 * Widget listeners that send the order lifecycle to GTM with the payloads CoW Swap sends, plus the asset ticker.
 * The widget reports every order of the account, so outcomes of other assets' orders get a `null` ticker.
 */
export function useWidgetOrderAnalytics(asset: RwaAsset): CowWidgetEventListeners {
  return useMemo(() => {
    const { ticker } = asset
    const isAssetToken = (chainId: number, address: string): boolean =>
      asset.tokens.some((token) => token.chainId === chainId && areAddressesEqual(token.address, address))
    // A bridged order's buy token is the intermediate token on the source chain, the asset token is the bridge output
    const getOrderTicker = ({ chainId, order, bridgeOrder }: OrderOutcomePayload): string | null => {
      const bridgedToken = bridgeOrder?.quoteAmounts.bridgeMinReceiveAmount.token
      const isAssetOrder =
        isAssetToken(chainId, order.sellToken) ||
        isAssetToken(chainId, order.buyToken) ||
        (bridgedToken ? isAssetToken(bridgedToken.chainId, bridgedToken.address) : false)

      return isAssetOrder ? ticker : null
    }

    return [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: (payload) => {
          trackEvent('order_submitted', {
            ...mapPostedOrder(payload),
            ticker,
            // On a bridged order `outputToken` is on the destination chain, `inputToken` is always on `chainId`
            side: isAssetToken(payload.chainId, payload.inputToken.address) ? 'sell' : 'buy',
          })
        },
      },
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: (payload) =>
          trackEvent('swap_executed', { ...mapFulfilledOrder(payload), ticker: getOrderTicker(payload) }),
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: (payload) =>
          trackEvent('swap_cancelled', { ...mapCancelledOrder(payload), ticker: getOrderTicker(payload) }),
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: (payload) =>
          trackEvent('swap_expired', { ...mapExpiredOrder(payload), ticker: getOrderTicker(payload) }),
      },
    ]
  }, [asset])
}

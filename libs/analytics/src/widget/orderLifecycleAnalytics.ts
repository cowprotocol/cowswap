import {
  CowWidgetEvents,
  SimpleCowEventEmitter,
  CowWidgetEventPayloadMap,
  OnPostedOrderPayload,
  OnFulfilledOrderPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  BaseOrderPayload,
} from '@cowprotocol/events'

import { getCowAnalytics } from '../utils'

// Specialized helper function for string properties to ensure we always return a string
const safeGetString = <T, K extends keyof T>(obj: T | undefined, key: K, fallback: string = ''): string => {
  const value = obj && obj[key] !== undefined ? obj[key] : fallback
  return String(value)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getOrderPayload = (payload: BaseOrderPayload) => ({
  walletAddress: safeGetString(payload.order, 'owner'),
  orderId: safeGetString(payload.order, 'uid'),
  chainId: payload.chainId.toString(),
  sellToken: safeGetString(payload.order, 'sellToken'),
  buyToken: safeGetString(payload.order, 'buyToken'),
  sellAmount: safeGetString(payload.order, 'sellAmount'),
  buyAmount: safeGetString(payload.order, 'buyAmount'),
})

const EVENT_CONFIGS = [
  // Handle order submission
  {
    event: CowWidgetEvents.ON_POSTED_ORDER,
    analyticsEvent: 'order_submitted',
    mapper: (p: OnPostedOrderPayload) => ({
      walletAddress: p.owner,
      orderId: p.orderUid,
      chainId: p.chainId.toString(),
      sellToken: safeGetString(p.inputToken, 'address'),
      buyToken: safeGetString(p.outputToken, 'address'),
      sellAmount: p.inputAmount.toString() || '',
      buyAmount: p.outputAmount.toString() || '',
      sellTokenSymbol: safeGetString(p.inputToken, 'symbol'),
      buyTokenSymbol: safeGetString(p.outputToken, 'symbol'),
      orderType: p.orderType,
      kind: p.kind,
      receiver: p.receiver || '',
      orderCreationHash: p.orderCreationHash || '',
    }),
  },
  // Handle order fulfillment
  {
    event: CowWidgetEvents.ON_FULFILLED_ORDER,
    analyticsEvent: 'swap_executed',
    mapper: (p: OnFulfilledOrderPayload) => ({
      ...getOrderPayload(p),
      executedSellAmount: safeGetString(p.order, 'executedSellAmount'),
      executedBuyAmount: safeGetString(p.order, 'executedBuyAmount'),
      executedFeeAmount: safeGetString(p.order, 'executedFeeAmount'),
    }),
  },
  // Handle order cancellation
  {
    event: CowWidgetEvents.ON_CANCELLED_ORDER,
    analyticsEvent: 'swap_cancelled',
    mapper: (p: OnCancelledOrderPayload) => ({
      ...getOrderPayload(p),
      reason: 'cancelled',
      transactionHash: p.transactionHash || '',
    }),
  },
  // Handle order expiration
  {
    event: CowWidgetEvents.ON_EXPIRED_ORDER,
    analyticsEvent: 'swap_expired',
    mapper: (p: OnExpiredOrderPayload) => ({
      ...getOrderPayload(p),
      reason: 'expired',
    }),
  },
]

// Sets up event handlers for order lifecycle events.
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const setupEventHandlers = (eventEmitter: SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>) => {
  // Register each event handler
  EVENT_CONFIGS.forEach((config) => {
    const { event, mapper, analyticsEvent } = config

    eventEmitter.on({
      event,
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: (payload: any) => {
        const analytics = getCowAnalytics()

        if (!analytics) {
          console.warn('Analytics instance not available for event:', analyticsEvent)
          return
        }

        analytics.sendEvent(analyticsEvent, mapper(payload))
      },
    })
  })
}

import { CowWidgetEvents, SimpleCowEventEmitter, CowWidgetEventPayloadMap } from '@cowprotocol/events'

import { CowAnalytics } from '../CowAnalytics'

// Map CowWidgetEvents to GTM event names - only include the ones we use
export const EVENT_MAPPING: Partial<Record<CowWidgetEvents, string>> = {
  [CowWidgetEvents.ON_POSTED_ORDER]: 'order_submitted',
  [CowWidgetEvents.ON_FULFILLED_ORDER]: 'swap_executed',
  [CowWidgetEvents.ON_CANCELLED_ORDER]: 'swap_cancelled',
  [CowWidgetEvents.ON_EXPIRED_ORDER]: 'swap_expired',
}

interface TrackingEventPayload {
  eventCategory?: string
  eventAction?: string
  eventLabel?: string
  [key: string]: string | number | boolean | undefined
}

interface OrderTrackingPayload extends TrackingEventPayload {
  walletAddress: string
  orderId: string
  chainId: number
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
}

interface PostedOrderPayload {
  owner: string
  orderUid: string
  chainId: number
  inputToken?: { address?: string; symbol?: string }
  outputToken?: { address?: string; symbol?: string }
  inputAmount?: { toString(): string }
  outputAmount?: { toString(): string }
  orderType: string
  kind: string
  receiver?: string
  orderCreationHash?: string
}

interface OrderPayload {
  chainId: number
  order?: {
    owner?: string
    uid?: string
    sellToken?: string
    buyToken?: string
    sellAmount?: string
    buyAmount?: string
    executedSellAmount?: string
    executedBuyAmount?: string
    executedFeeAmount?: string
  }
  transactionHash?: string
}

// Type guard functions to check payload types
function isPostedOrderPayload(payload: unknown): payload is PostedOrderPayload {
  return !!(
    payload &&
    typeof payload === 'object' &&
    'owner' in payload &&
    'orderUid' in payload &&
    'chainId' in payload &&
    typeof (payload as any).chainId === 'number'
  )
}

function isOrderPayload(payload: unknown): payload is OrderPayload {
  return !!(
    payload &&
    typeof payload === 'object' &&
    'chainId' in payload &&
    typeof (payload as any).chainId === 'number' &&
    ('order' in payload || ('transactionHash' in payload && payload.transactionHash !== undefined))
  )
}

// Specialized helper function for string properties to ensure we always return a string
const safeGetString = <T, K extends keyof T>(obj: T | undefined, key: K, fallback: string = ''): string => {
  const value = obj && obj[key] !== undefined ? obj[key] : fallback
  return String(value)
}

// Generate default tracking payload
const createDefaultTrackingPayload = (): OrderTrackingPayload => {
  return {
    walletAddress: '',
    orderId: '',
    chainId: 0,
    sellToken: '',
    buyToken: '',
    sellAmount: '',
    buyAmount: '',
  }
}

// Helper to extract common order properties
const getCommonOrderProperties = (payload: unknown, isPostedOrder = false): OrderTrackingPayload => {
  if (isPostedOrder && isPostedOrderPayload(payload)) {
    return {
      walletAddress: payload.owner,
      orderId: payload.orderUid,
      chainId: payload.chainId,
      sellToken: safeGetString(payload.inputToken, 'address'),
      buyToken: safeGetString(payload.outputToken, 'address'),
      sellAmount: payload.inputAmount?.toString() || '',
      buyAmount: payload.outputAmount?.toString() || '',
    }
  }

  if (isOrderPayload(payload)) {
    return {
      walletAddress: safeGetString(payload.order, 'owner'),
      orderId: safeGetString(payload.order, 'uid'),
      chainId: payload.chainId,
      sellToken: safeGetString(payload.order, 'sellToken'),
      buyToken: safeGetString(payload.order, 'buyToken'),
      sellAmount: safeGetString(payload.order, 'sellAmount'),
      buyAmount: safeGetString(payload.order, 'buyAmount'),
      ...(payload.transactionHash ? { transactionHash: payload.transactionHash } : {}),
    }
  }

  // Fallback for unexpected payload types
  return createDefaultTrackingPayload()
}

// Helper to set up an event handler with common logic
export const setupEventHandler = (
  analytics: CowAnalytics,
  event: CowWidgetEvents,
  payload: unknown,
  getAdditionalProps: (payload: any) => Record<string, any>,
  isPostedOrder = false,
) => {
  const eventName = EVENT_MAPPING[event]
  if (eventName) {
    const commonProps = getCommonOrderProperties(payload, isPostedOrder)
    const additionalProps = getAdditionalProps(payload)

    analytics.sendEvent(eventName, {
      ...commonProps,
      ...additionalProps,
    })
  } else {
    console.warn('No event mapping found for event:', event)
  }
}

// Event handler setup functions
export const handlePostedOrder = (analytics: CowAnalytics, payload: unknown) => {
  setupEventHandler(
    analytics,
    CowWidgetEvents.ON_POSTED_ORDER,
    payload,
    (p) => ({
      sellTokenSymbol: safeGetString(p.inputToken, 'symbol'),
      buyTokenSymbol: safeGetString(p.outputToken, 'symbol'),
      orderType: p.orderType,
      kind: p.kind,
      receiver: p.receiver || '',
      orderCreationHash: p.orderCreationHash || '',
    }),
    true,
  )
}

export const handleFulfilledOrder = (analytics: CowAnalytics, payload: unknown) => {
  setupEventHandler(analytics, CowWidgetEvents.ON_FULFILLED_ORDER, payload, (p) => ({
    executedSellAmount: safeGetString(p.order, 'executedSellAmount'),
    executedBuyAmount: safeGetString(p.order, 'executedBuyAmount'),
    executedFeeAmount: safeGetString(p.order, 'executedFeeAmount'),
  }))
}

export const handleCancelledOrder = (analytics: CowAnalytics, payload: unknown) => {
  setupEventHandler(analytics, CowWidgetEvents.ON_CANCELLED_ORDER, payload, (p) => ({
    reason: 'cancelled',
    transactionHash: p.transactionHash || '',
  }))
}

export const handleExpiredOrder = (analytics: CowAnalytics, payload: unknown) => {
  setupEventHandler(analytics, CowWidgetEvents.ON_EXPIRED_ORDER, payload, () => ({
    reason: 'expired',
  }))
}

export const setupEventHandlers = (
  eventEmitter: SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>,
  getAnalytics: () => CowAnalytics | undefined,
) => {
  // Handle order submission
  eventEmitter.on({
    event: CowWidgetEvents.ON_POSTED_ORDER,
    handler: (payload: unknown) => {
      const analytics = getAnalytics()
      if (analytics) {
        handlePostedOrder(analytics, payload)
      } else {
        console.warn('Analytics instance not available for event: order_submitted')
      }
    },
  })

  // Handle order fulfillment
  eventEmitter.on({
    event: CowWidgetEvents.ON_FULFILLED_ORDER,
    handler: (payload: unknown) => {
      const analytics = getAnalytics()
      if (analytics) {
        handleFulfilledOrder(analytics, payload)
      } else {
        console.warn('Analytics instance not available for event: swap_executed')
      }
    },
  })

  // Handle order cancellation
  eventEmitter.on({
    event: CowWidgetEvents.ON_CANCELLED_ORDER,
    handler: (payload: unknown) => {
      const analytics = getAnalytics()
      if (analytics) {
        handleCancelledOrder(analytics, payload)
      } else {
        console.warn('Analytics instance not available for event: swap_cancelled')
      }
    },
  })

  // Handle order expiration
  eventEmitter.on({
    event: CowWidgetEvents.ON_EXPIRED_ORDER,
    handler: (payload: unknown) => {
      const analytics = getAnalytics()
      if (analytics) {
        handleExpiredOrder(analytics, payload)
      } else {
        console.warn('Analytics instance not available for event: swap_expired')
      }
    },
  })
}

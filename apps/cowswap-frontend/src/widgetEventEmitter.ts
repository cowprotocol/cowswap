import { CowAnalytics } from '@cowprotocol/analytics'
import { CowWidgetEventPayloadMap, CowWidgetEvents, SimpleCowEventEmitter } from '@cowprotocol/events'

const getCowAnalytics = (): CowAnalytics | undefined => {
  if (typeof window !== 'undefined' && 'cowAnalyticsInstance' in window) {
    return window.cowAnalyticsInstance as CowAnalytics
  }
  return undefined
}

export const WIDGET_EVENT_EMITTER = Object.freeze(
  new SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>(),
)

interface TrackingEventPayload {
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

// Define interfaces for the payload types to avoid 'as any' casts
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
    'chainId' in payload
  )
}

function isOrderPayload(payload: unknown): payload is OrderPayload {
  return !!(
    payload &&
    typeof payload === 'object' &&
    'chainId' in payload &&
    ('order' in payload || 'transactionHash' in payload)
  )
}

// Helper function to safely access nested properties with fallbacks
const safeGet = <T, K extends keyof T>(obj: T | undefined, key: K, fallback: any = ''): any =>
  obj ? (obj[key] ?? fallback) : fallback

// Map CowWidgetEvents to GTM event names - only include the ones we use
const EVENT_MAPPING: Partial<Record<CowWidgetEvents, string>> = {
  [CowWidgetEvents.ON_POSTED_ORDER]: 'order_submitted',
  [CowWidgetEvents.ON_FULFILLED_ORDER]: 'swap_executed',
  [CowWidgetEvents.ON_CANCELLED_ORDER]: 'swap_failed',
  [CowWidgetEvents.ON_EXPIRED_ORDER]: 'swap_failed',
}

// Helper to extract common order properties
const getCommonOrderProperties = (payload: unknown, isPostedOrder = false): OrderTrackingPayload => {
  if (isPostedOrder && isPostedOrderPayload(payload)) {
    return {
      walletAddress: payload.owner,
      orderId: payload.orderUid,
      chainId: payload.chainId,
      sellToken: safeGet(payload.inputToken, 'address'),
      buyToken: safeGet(payload.outputToken, 'address'),
      sellAmount: payload.inputAmount?.toString() || '',
      buyAmount: payload.outputAmount?.toString() || '',
    }
  }

  if (isOrderPayload(payload)) {
    return {
      walletAddress: safeGet(payload.order, 'owner'),
      orderId: safeGet(payload.order, 'uid'),
      chainId: payload.chainId,
      sellToken: safeGet(payload.order, 'sellToken'),
      buyToken: safeGet(payload.order, 'buyToken'),
      sellAmount: safeGet(payload.order, 'sellAmount'),
      buyAmount: safeGet(payload.order, 'buyAmount'),
    }
  }

  // Fallback for unexpected payload types
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

// Helper to set up an event handler with common logic
const setupEventHandler = <T extends CowWidgetEvents>(
  event: T,
  getAdditionalProps: (payload: any) => Record<string, any>,
  isPostedOrder = false,
) => {
  WIDGET_EVENT_EMITTER.on({
    event,
    handler: (payload: unknown) => {
      const commonProps = getCommonOrderProperties(payload, isPostedOrder)
      const additionalProps = getAdditionalProps(payload)

      const eventName = EVENT_MAPPING[event]
      if (eventName) {
        const analytics = getCowAnalytics()
        if (analytics) {
          analytics.sendEvent(eventName, {
            ...commonProps,
            ...additionalProps,
          })
        } else {
          console.warn('Analytics instance not available for event:', eventName)
        }
      }
    },
  })
}

// Configure event handlers
const setupEventHandlers = () => {
  // Handle order submission
  setupEventHandler(
    CowWidgetEvents.ON_POSTED_ORDER,
    (payload) => ({
      sellTokenSymbol: safeGet(payload.inputToken, 'symbol'),
      buyTokenSymbol: safeGet(payload.outputToken, 'symbol'),
      orderType: payload.orderType,
      kind: payload.kind,
      receiver: payload.receiver || '',
      orderCreationHash: payload.orderCreationHash || '',
    }),
    true, // isPostedOrder
  )

  // Handle order fulfillment
  setupEventHandler(CowWidgetEvents.ON_FULFILLED_ORDER, (payload) => ({
    executedSellAmount: safeGet(payload.order, 'executedSellAmount'),
    executedBuyAmount: safeGet(payload.order, 'executedBuyAmount'),
    executedFeeAmount: safeGet(payload.order, 'executedFeeAmount'),
  }))

  // Handle order cancellation
  setupEventHandler(CowWidgetEvents.ON_CANCELLED_ORDER, (payload) => ({
    reason: 'cancelled',
    transactionHash: payload.transactionHash || '',
  }))

  // Handle order expiration
  setupEventHandler(CowWidgetEvents.ON_EXPIRED_ORDER, () => ({
    reason: 'expired',
  }))
}

setupEventHandlers()

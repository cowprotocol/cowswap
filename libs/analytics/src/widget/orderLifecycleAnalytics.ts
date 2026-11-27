import { CowEventHandler, CowWidgetEventPayloadMap, CowWidgetEvents, SimpleCowEventEmitter } from '@cowprotocol/events'

import {
  type AnalyticsPayload,
  mapCancelledOrder,
  mapExpiredOrder,
  mapFulfilledOrder,
  mapPostedOrder,
} from './orderLifecyclePayloads'

import { getCowAnalytics } from '../utils'

export * from './orderLifecyclePayloads'

function createAnalyticsHandler<K extends CowWidgetEvents>(
  analyticsEvent: string,
  mapper: (payload: CowWidgetEventPayloadMap[K]) => AnalyticsPayload,
): CowEventHandler<CowWidgetEventPayloadMap, K> {
  return (payload: CowWidgetEventPayloadMap[K]): void => {
    const analytics = getCowAnalytics()

    if (!analytics) {
      return
    }

    analytics.sendEvent(analyticsEvent, mapper(payload))
  }
}

// Sets up event handlers for order lifecycle events.
export const setupEventHandlers = (
  eventEmitter: SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>,
): void => {
  // Register each event handler
  eventEmitter.on({
    event: CowWidgetEvents.ON_POSTED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_POSTED_ORDER>('order_submitted', mapPostedOrder),
  })

  eventEmitter.on({
    event: CowWidgetEvents.ON_FULFILLED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_FULFILLED_ORDER>('swap_executed', mapFulfilledOrder),
  })

  eventEmitter.on({
    event: CowWidgetEvents.ON_CANCELLED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_CANCELLED_ORDER>('swap_cancelled', mapCancelledOrder),
  })

  eventEmitter.on({
    event: CowWidgetEvents.ON_EXPIRED_ORDER,
    handler: createAnalyticsHandler<CowWidgetEvents.ON_EXPIRED_ORDER>('swap_expired', mapExpiredOrder),
  })
}

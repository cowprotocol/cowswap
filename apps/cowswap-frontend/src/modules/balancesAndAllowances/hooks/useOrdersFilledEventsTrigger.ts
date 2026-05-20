import { useEffect, useState } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { CowEventListener, CowWidgetEventPayloadMap, CowWidgetEvents } from '@cowprotocol/events'

import ms from 'ms.macro'
import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

const DEBOUNCE_FOR_PENDING_ORDERS_MS = ms`1s`

type OrderFilledListener = CowEventListener<CowWidgetEventPayloadMap, CowWidgetEvents.ON_FULFILLED_ORDER>
type BridgingSuccessListener = CowEventListener<CowWidgetEventPayloadMap, CowWidgetEvents.ON_BRIDGING_SUCCESS>

/**
 * Invalidate cache trigger that only updates when the number of pending orders decreases
 * This useful to force a refresh when orders are being fulfilled or bridging is completed
 * */
export function useOrdersFilledEventsTrigger(): number {
  const [triggerValue, setTriggerValue] = useState(0)

  useEffect(() => {
    const incrementTrigger = (): void => {
      setTriggerValue((prev) => prev + 1)
    }

    const onFulfilledListener: OrderFilledListener = {
      event: CowWidgetEvents.ON_FULFILLED_ORDER,
      handler: incrementTrigger,
    }

    const onBridgingListener: BridgingSuccessListener = {
      event: CowWidgetEvents.ON_BRIDGING_SUCCESS,
      handler: incrementTrigger,
    }

    WIDGET_EVENT_EMITTER.on(onFulfilledListener)
    WIDGET_EVENT_EMITTER.on(onBridgingListener)

    return (): void => {
      WIDGET_EVENT_EMITTER.off(onFulfilledListener)
      WIDGET_EVENT_EMITTER.off(onBridgingListener)
    }
  }, [])

  return useDebounce(triggerValue, DEBOUNCE_FOR_PENDING_ORDERS_MS)
}

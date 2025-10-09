import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import {
  CowWidgetEventListener,
  CowWidgetEvents,
  OnBridgingSuccessPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
} from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { OrderProgressBarStepName } from '../constants'
import { updateOrderProgressBarCountdown, updateOrderProgressBarStepName } from '../state/atoms'

export function OrderProgressEventsUpdater(): null {
  const setCountdown = useSetAtom(updateOrderProgressBarCountdown)
  const setStepName = useSetAtom(updateOrderProgressBarStepName)

  const finalizeOrderStep = useCallback(
    (orderUid: string | undefined, step: OrderProgressBarStepName) => {
      if (!orderUid) {
        return
      }

      setStepName({ orderId: orderUid, value: step })
      setCountdown({ orderId: orderUid, value: null })
    },
    [setCountdown, setStepName],
  )

  useEffect(() => {
    const listeners: CowWidgetEventListener[] = [
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: (payload) => {
          const typedPayload = payload as OnFulfilledOrderPayload
          const orderUid = typedPayload.order.uid
          const step = typedPayload.bridgeOrder
            ? OrderProgressBarStepName.BRIDGING_IN_PROGRESS
            : OrderProgressBarStepName.FINISHED
          finalizeOrderStep(orderUid, step)
        },
      },
      {
        event: CowWidgetEvents.ON_BRIDGING_SUCCESS,
        handler: (payload) => {
          const typedPayload = payload as OnBridgingSuccessPayload
          const orderUid = typedPayload.order.uid
          finalizeOrderStep(orderUid, OrderProgressBarStepName.BRIDGING_FINISHED)
        },
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: (payload) => {
          const typedPayload = payload as OnCancelledOrderPayload
          const orderUid = typedPayload.order.uid
          finalizeOrderStep(orderUid, OrderProgressBarStepName.CANCELLED)
        },
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: (payload) => {
          const typedPayload = payload as OnExpiredOrderPayload
          const orderUid = typedPayload.order.uid
          finalizeOrderStep(orderUid, OrderProgressBarStepName.EXPIRED)
        },
      },
    ]

    listeners.forEach((listener) => WIDGET_EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => WIDGET_EVENT_EMITTER.off(listener))
    }
  }, [finalizeOrderStep])

  return null
}

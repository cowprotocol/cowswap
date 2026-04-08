import { useAtomValue, useSetAtom } from 'jotai'
import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  CowWidgetEventListener,
  CowWidgetEvents,
  OnBridgingSuccessPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
  OnFulfilledOrderPayload,
} from '@cowprotocol/events'
import { useWalletInfo } from '@cowprotocol/wallet'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { usePendingOrdersFillability } from 'modules/ordersTable'

import {
  computeUnfillableOrderIds,
  EXECUTING_STEP_MIN_DISPLAY_TIME_MS,
  getCompletionDelayMs,
  getNewlyFillableOrderIds,
  shouldStageExecutingStep,
} from './utils'

import { OrderProgressBarStepName } from '../constants'
import {
  ordersProgressBarStateAtom,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from '../state/atoms'
import { OrdersProgressBarState } from '../types'

function useUnfillableOrderIds(): string[] {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId as SupportedChainId, account)
  const marketOrders = useMemo(
    () => pendingOrders.filter((order) => order.class === OrderClass.MARKET),
    [pendingOrders],
  )
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)

  return useMemo(
    () => computeUnfillableOrderIds(marketOrders, pendingOrdersFillability),
    [marketOrders, pendingOrdersFillability],
  )
}

function useOrdersProgressStateRef(
  ordersProgressState: OrdersProgressBarState,
): MutableRefObject<OrdersProgressBarState> {
  const ordersProgressStateRef = useRef(ordersProgressState)

  useEffect(() => {
    ordersProgressStateRef.current = ordersProgressState
  }, [ordersProgressState])

  return ordersProgressStateRef
}

function useCompletionTimersRef(): MutableRefObject<Record<string, NodeJS.Timeout>> {
  const completionTimersRef = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    const completionTimers = completionTimersRef.current

    return () => {
      Object.values(completionTimers).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return completionTimersRef
}

function useOrderProgressEventListeners(
  finalizeOrderStep: (orderUid: string, step: OrderProgressBarStepName) => void,
): void {
  useEffect(() => {
    const listeners: CowWidgetEventListener[] = [
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: (payload: OnFulfilledOrderPayload) => {
          const orderUid = payload.order.uid
          const step = payload.bridgeOrder
            ? OrderProgressBarStepName.BRIDGING_IN_PROGRESS
            : OrderProgressBarStepName.FINISHED
          finalizeOrderStep(orderUid, step)
        },
      },
      {
        event: CowWidgetEvents.ON_BRIDGING_SUCCESS,
        handler: (payload: OnBridgingSuccessPayload) => {
          finalizeOrderStep(payload.order.uid, OrderProgressBarStepName.BRIDGING_FINISHED)
        },
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: (payload: OnCancelledOrderPayload) => {
          finalizeOrderStep(payload.order.uid, OrderProgressBarStepName.CANCELLED)
        },
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: (payload: OnExpiredOrderPayload) => {
          finalizeOrderStep(payload.order.uid, OrderProgressBarStepName.EXPIRED)
        },
      },
    ]

    listeners.forEach((listener) => WIDGET_EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => WIDGET_EVENT_EMITTER.off(listener))
    }
  }, [finalizeOrderStep])
}

export function OrderProgressEventsUpdater(): null {
  const ordersProgressState = useAtomValue(ordersProgressBarStateAtom)
  const setCountdown = useSetAtom(updateOrderProgressBarCountdown)
  const setStepName = useSetAtom(updateOrderProgressBarStepName)
  const unfillableIds = useUnfillableOrderIds()
  const previousUnfillableRef = useRef<Set<string>>(new Set())
  const ordersProgressStateRef = useOrdersProgressStateRef(ordersProgressState)
  const completionTimersRef = useCompletionTimersRef()

  const scheduleCompletionStep = useCallback(
    (orderUid: string, step: OrderProgressBarStepName, delayMs: number) => {
      const scheduledTimer = setTimeout(() => {
        if (completionTimersRef.current[orderUid] !== scheduledTimer) {
          return
        }

        delete completionTimersRef.current[orderUid]

        const latestState = ordersProgressStateRef.current[orderUid]

        if (!latestState || latestState.progressBarStepName !== OrderProgressBarStepName.EXECUTING) {
          return
        }

        setStepName({ orderId: orderUid, value: step })
      }, delayMs)

      completionTimersRef.current[orderUid] = scheduledTimer
    },
    [completionTimersRef, ordersProgressStateRef, setStepName],
  )

  const finalizeOrderStep = useCallback(
    (orderUid: string, step: OrderProgressBarStepName) => {
      const currentState = ordersProgressStateRef.current[orderUid]
      const currentStep = currentState?.progressBarStepName

      if (currentStep === step) {
        return
      }

      const currentCountdown = currentState?.countdown

      if (typeof currentCountdown !== 'undefined' && currentCountdown !== null) {
        setCountdown({ orderId: orderUid, value: null })
      }

      const existingTimer = completionTimersRef.current[orderUid]

      if (existingTimer) {
        clearTimeout(existingTimer)
        delete completionTimersRef.current[orderUid]
      }

      if (shouldStageExecutingStep(currentStep, currentState?.previousStepName, step)) {
        setStepName({ orderId: orderUid, value: OrderProgressBarStepName.EXECUTING })
        scheduleCompletionStep(orderUid, step, EXECUTING_STEP_MIN_DISPLAY_TIME_MS)

        return
      }

      const completionDelayMs = getCompletionDelayMs(currentStep, step, currentState?.lastTimeChangedSteps)

      if (completionDelayMs > 0) {
        scheduleCompletionStep(orderUid, step, completionDelayMs)

        return
      }

      setStepName({ orderId: orderUid, value: step })
    },
    [completionTimersRef, ordersProgressStateRef, scheduleCompletionStep, setCountdown, setStepName],
  )

  useEffect(() => {
    const previousUnfillable = previousUnfillableRef.current
    const currentUnfillable = new Set(unfillableIds)
    const currentProgressState = ordersProgressStateRef.current

    const newlyFillable = getNewlyFillableOrderIds(previousUnfillable, currentUnfillable)

    newlyFillable.forEach((orderId) => {
      const currentStep = currentProgressState[orderId]?.progressBarStepName

      if (currentStep && currentStep !== OrderProgressBarStepName.UNFILLABLE) {
        return
      }

      finalizeOrderStep(orderId, OrderProgressBarStepName.SOLVING)
    })
    currentUnfillable.forEach((orderId) => finalizeOrderStep(orderId, OrderProgressBarStepName.UNFILLABLE))

    // Persist for the next diff so we only reset orders that actually recovered.
    previousUnfillableRef.current = currentUnfillable
  }, [unfillableIds, finalizeOrderStep, ordersProgressStateRef])

  useOrderProgressEventListeners(finalizeOrderStep)

  return null
}

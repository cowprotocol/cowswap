import { useAtomValue, useSetAtom, useStore } from 'jotai'
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
  hasProgressBarLeftInitialStep,
  isCompletionStep,
  shouldStageExecutingStep,
} from './utils'

import { OrderProgressBarStepName } from '../constants'
import { MINIMUM_STEP_DISPLAY_TIME, shouldApplyStepNameImmediately } from '../hooks/useOrderProgressBarProps'
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

type ScheduledStepTimer = {
  expectedCurrentStep: OrderProgressBarStepName | undefined
  step: OrderProgressBarStepName
  timer: NodeJS.Timeout
}

function useStepTimersRef(): MutableRefObject<Record<string, ScheduledStepTimer>> {
  const stepTimersRef = useRef<Record<string, ScheduledStepTimer>>({})

  useEffect(() => {
    const stepTimers = stepTimersRef.current

    return () => {
      Object.values(stepTimers).forEach(({ timer }) => clearTimeout(timer))
    }
  }, [])

  return stepTimersRef
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

function useUnfillableProgressTransitions(
  ordersProgressState: OrdersProgressBarState,
  unfillableIds: string[],
  getCurrentProgressState: (orderUid: string) => OrdersProgressBarState[string] | undefined,
  clearStepTimer: (
    orderUid: string,
    shouldClear?: (
      scheduledStep: OrderProgressBarStepName,
      expectedCurrentStep: OrderProgressBarStepName | undefined,
    ) => boolean,
  ) => void,
  finalizeOrderStep: (orderUid: string, step: OrderProgressBarStepName) => void,
): void {
  const previousUnfillableRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const previousUnfillable = previousUnfillableRef.current
    const currentUnfillable = new Set(unfillableIds)

    const newlyFillable = getNewlyFillableOrderIds(previousUnfillable, currentUnfillable)

    newlyFillable.forEach((orderId) => {
      const currentStep = getCurrentProgressState(orderId)?.progressBarStepName

      if (currentStep !== OrderProgressBarStepName.UNFILLABLE) {
        clearStepTimer(orderId, (scheduledStep) => scheduledStep === OrderProgressBarStepName.UNFILLABLE)
        return
      }

      finalizeOrderStep(orderId, OrderProgressBarStepName.SOLVING)
    })

    currentUnfillable.forEach((orderId) => {
      const currentStep = getCurrentProgressState(orderId)?.progressBarStepName

      if (!hasProgressBarLeftInitialStep(currentStep)) {
        return
      }

      if (
        currentStep === OrderProgressBarStepName.EXECUTING ||
        currentStep === OrderProgressBarStepName.CANCELLING ||
        currentStep === OrderProgressBarStepName.CANCELLED ||
        currentStep === OrderProgressBarStepName.EXPIRED ||
        currentStep === OrderProgressBarStepName.CANCELLATION_FAILED ||
        isCompletionStep(currentStep)
      ) {
        return
      }

      finalizeOrderStep(orderId, OrderProgressBarStepName.UNFILLABLE)
    })

    // Persist for the next diff so we only reset orders that actually recovered.
    previousUnfillableRef.current = currentUnfillable
  }, [clearStepTimer, finalizeOrderStep, getCurrentProgressState, ordersProgressState, unfillableIds])
}

export function OrderProgressEventsUpdater(): null {
  const store = useStore()
  const ordersProgressState = useAtomValue(ordersProgressBarStateAtom)
  const setCountdown = useSetAtom(updateOrderProgressBarCountdown)
  const setStepName = useSetAtom(updateOrderProgressBarStepName)
  const unfillableIds = useUnfillableOrderIds()
  const ordersProgressStateRef = useOrdersProgressStateRef(ordersProgressState)
  const stepTimersRef = useStepTimersRef()
  const getCurrentProgressState = useCallback(
    (orderUid: string) => store.get(ordersProgressBarStateAtom)[orderUid],
    [store],
  )
  const clearStepTimer = useCallback(
    (
      orderUid: string,
      shouldClear: (
        scheduledStep: OrderProgressBarStepName,
        expectedCurrentStep: OrderProgressBarStepName | undefined,
      ) => boolean = () => true,
    ) => {
      const existingTimer = stepTimersRef.current[orderUid]

      if (!existingTimer || !shouldClear(existingTimer.step, existingTimer.expectedCurrentStep)) {
        return
      }

      clearTimeout(existingTimer.timer)
      delete stepTimersRef.current[orderUid]
    },
    [stepTimersRef],
  )

  const scheduleStepUpdate = useCallback(
    (
      orderUid: string,
      step: OrderProgressBarStepName,
      delayMs: number,
      expectedCurrentStep: OrderProgressBarStepName | undefined,
    ) => {
      const timerRef = setTimeout(() => {
        if (stepTimersRef.current[orderUid]?.timer !== timerRef) {
          return
        }

        delete stepTimersRef.current[orderUid]

        const latestState = ordersProgressStateRef.current[orderUid]

        if (!latestState || latestState.progressBarStepName !== expectedCurrentStep) {
          return
        }

        setStepName({ orderId: orderUid, value: step })
      }, delayMs)

      stepTimersRef.current[orderUid] = {
        expectedCurrentStep,
        step,
        timer: timerRef,
      }
    },
    [ordersProgressStateRef, setStepName, stepTimersRef],
  )

  const finalizeOrderStep = useCallback(
    (orderUid: string, step: OrderProgressBarStepName) => {
      const currentState = ordersProgressStateRef.current[orderUid]
      const currentStep = currentState?.progressBarStepName
      clearStepTimer(orderUid)

      if (currentStep === step) {
        return
      }

      const currentCountdown = currentState?.countdown

      if (typeof currentCountdown !== 'undefined' && currentCountdown !== null) {
        setCountdown({ orderId: orderUid, value: null })
      }

      if (shouldStageExecutingStep(currentStep, step, currentState?.hasShownExecutingInCurrentAttempt)) {
        setStepName({ orderId: orderUid, value: OrderProgressBarStepName.EXECUTING })
        scheduleStepUpdate(orderUid, step, EXECUTING_STEP_MIN_DISPLAY_TIME_MS, OrderProgressBarStepName.EXECUTING)

        return
      }

      const completionDelayMs = getCompletionDelayMs(currentStep, step, currentState?.lastTimeChangedSteps)

      if (completionDelayMs > 0) {
        scheduleStepUpdate(orderUid, step, completionDelayMs, OrderProgressBarStepName.EXECUTING)

        return
      }

      const timeSinceLastChange = currentState?.lastTimeChangedSteps
        ? Date.now() - currentState.lastTimeChangedSteps
        : 0

      if (!shouldApplyStepNameImmediately(currentState?.lastTimeChangedSteps, timeSinceLastChange, step)) {
        scheduleStepUpdate(orderUid, step, MINIMUM_STEP_DISPLAY_TIME - timeSinceLastChange, currentStep)

        return
      }

      setStepName({ orderId: orderUid, value: step })
    },
    [clearStepTimer, ordersProgressStateRef, scheduleStepUpdate, setCountdown, setStepName],
  )

  useUnfillableProgressTransitions(
    ordersProgressState,
    unfillableIds,
    getCurrentProgressState,
    clearStepTimer,
    finalizeOrderStep,
  )
  useOrderProgressEventListeners(finalizeOrderStep)

  return null
}

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

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

import { usePendingOrdersFillability, type OrderFillability } from 'modules/ordersTable'

import { OrderProgressBarStepName } from '../constants'
import {
  ordersProgressBarStateAtom,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from '../state/atoms'

type OrderLike = {
  id: string
  isUnfillable?: boolean
}

export function computeUnfillableOrderIds(
  marketOrders: OrderLike[],
  pendingOrdersFillability: Record<string, OrderFillability | undefined>,
): string[] {
  // `isUnfillable` is toggled on the client (see UnfillableOrdersUpdater and OrdersTableList) after comparing quotes and allowances.
  const priceDerived = marketOrders.filter((order) => order.isUnfillable).map((order) => order.id)

  const fillabilityDerived = Object.entries(pendingOrdersFillability).reduce<string[]>(
    (acc, [orderId, fillability]) => {
      if (!fillability) {
        return acc
      }

      const lacksBalance = fillability.hasEnoughBalance === false
      const lacksAllowance = fillability.hasEnoughAllowance === false && !fillability.hasPermit

      if (lacksBalance || lacksAllowance) {
        acc.push(orderId)
      }

      return acc
    },
    [],
  )

  // An order can be flagged by both mechanisms; the Set keeps the list unique.
  return Array.from(new Set([...priceDerived, ...fillabilityDerived]))
}

export function getNewlyFillableOrderIds(previous: Iterable<string>, current: Iterable<string>): string[] {
  const currentSet = new Set(current)
  const newlyFillable: string[] = []

  for (const orderId of previous) {
    if (!currentSet.has(orderId)) {
      newlyFillable.push(orderId)
    }
  }

  return newlyFillable
}

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

export function OrderProgressEventsUpdater(): null {
  const ordersProgressState = useAtomValue(ordersProgressBarStateAtom)
  const setCountdown = useSetAtom(updateOrderProgressBarCountdown)
  const setStepName = useSetAtom(updateOrderProgressBarStepName)
  const unfillableIds = useUnfillableOrderIds()
  const previousUnfillableRef = useRef<Set<string>>(new Set())
  const ordersProgressStateRef = useRef(ordersProgressState)

  useEffect(() => {
    ordersProgressStateRef.current = ordersProgressState
  }, [ordersProgressState])

  const finalizeOrderStep = useCallback(
    (orderUid: string, step: OrderProgressBarStepName) => {
      const currentState = ordersProgressStateRef.current[orderUid]

      if (currentState?.progressBarStepName === step) {
        return
      }

      setStepName({ orderId: orderUid, value: step })

      const currentCountdown = currentState?.countdown

      if (typeof currentCountdown !== 'undefined' && currentCountdown !== null) {
        setCountdown({ orderId: orderUid, value: null })
      }
    },
    [setCountdown, setStepName],
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
  }, [unfillableIds, finalizeOrderStep])

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
          const orderUid = payload.order.uid
          finalizeOrderStep(orderUid, OrderProgressBarStepName.BRIDGING_FINISHED)
        },
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: (payload: OnCancelledOrderPayload) => {
          const orderUid = payload.order.uid
          finalizeOrderStep(orderUid, OrderProgressBarStepName.CANCELLED)
        },
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: (payload: OnExpiredOrderPayload) => {
          const orderUid = payload.order.uid
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

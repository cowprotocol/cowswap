import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

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

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'

import { OrderProgressBarStepName } from '../constants'
import { updateOrderProgressBarCountdown, updateOrderProgressBarStepName } from '../state/atoms'

function useUnfillableOrderIds(): string[] {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId as SupportedChainId, account)
  const marketOrders = useMemo(
    () => pendingOrders.filter((order) => order.class === OrderClass.MARKET),
    [pendingOrders],
  )
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)

  return useMemo(() => {
    // `isUnfillable` captures backend price-driven checks, while fillability covers wallet balance/allowance
    // issues. A given order can appear in both buckets; the final Set union keeps the list unique.
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

    return Array.from(new Set([...priceDerived, ...fillabilityDerived]))
  }, [marketOrders, pendingOrdersFillability])
}

export function OrderProgressEventsUpdater(): null {
  const setCountdown = useSetAtom(updateOrderProgressBarCountdown)
  const setStepName = useSetAtom(updateOrderProgressBarStepName)
  const unfillableOrderIds = useUnfillableOrderIds()

  const finalizeOrderStep = useCallback(
    (orderUid: string, step: OrderProgressBarStepName) => {
      setStepName({ orderId: orderUid, value: step })
      setCountdown({ orderId: orderUid, value: null })
    },
    [setCountdown, setStepName],
  )

  useEffect(() => {
    if (!unfillableOrderIds.length) {
      return
    }

    unfillableOrderIds.forEach((orderId) => finalizeOrderStep(orderId, OrderProgressBarStepName.UNFILLABLE))
  }, [unfillableOrderIds, finalizeOrderStep])

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

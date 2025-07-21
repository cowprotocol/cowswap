import React, { ReactNode } from 'react'

import { Check, Clock, X } from 'react-feather'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

// TODO: make CancelledDisplay, FilledDisplay, ExpiredDisplay common
import * as styledEl from '../../containers/OrderRow/styled'

export interface FillsAtStatusProps {
  childOrders?: ParsedOrder[]
  orderStatus: OrderStatus
  children: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TwapOrderStatus({ childOrders, orderStatus, children }: FillsAtStatusProps) {
  if (!childOrders) return null

  const areAllChildOrdersCancelled = childOrders.every((order) => order.status === OrderStatus.CANCELLED)

  // Second priority: Check for cancelled state
  if (areAllChildOrdersCancelled) {
    return (
      <>
        <b>
          <styledEl.CancelledDisplay>
            <X size={14} strokeWidth={2.5} />
            Order cancelled
          </styledEl.CancelledDisplay>
        </b>
        <i></i>
      </>
    )
  }

  // Third priority: Check for scheduled orders
  const hasScheduledOrder = childOrders.some((childOrder) => childOrder.status === OrderStatus.SCHEDULED)

  if (hasScheduledOrder) {
    return (
      <>
        <b>-</b>
        <i></i>
      </>
    )
  }

  // Fourth priority: Check for filled states
  const allChildrenFilled = childOrders.every(
    (childOrder) =>
      childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) >= 99.99,
  )

  if (allChildrenFilled) {
    return (
      <>
        <b>
          <styledEl.FilledDisplay>
            <Check size={14} strokeWidth={3.5} />
            Order filled
          </styledEl.FilledDisplay>
        </b>
        <i></i>
      </>
    )
  }

  const hasFilledOrders = childOrders.some(
    (childOrder) =>
      childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) > 0,
  )

  if (hasFilledOrders) {
    return (
      <>
        <b>
          <styledEl.FilledDisplay>
            <Check size={14} strokeWidth={3.5} />
            Order partially filled
          </styledEl.FilledDisplay>
        </b>
        <i></i>
      </>
    )
  }

  // Fifth priority: Check for expired state
  const allChildrenExpired = childOrders.every((childOrder) => childOrder.status === OrderStatus.EXPIRED)

  if (allChildrenExpired || orderStatus === OrderStatus.EXPIRED) {
    return (
      <>
        <b>
          <styledEl.ExpiredDisplay>
            <Clock size={14} strokeWidth={2.5} />
            Order expired
          </styledEl.ExpiredDisplay>
        </b>
        <i></i>
      </>
    )
  }

  return children
}

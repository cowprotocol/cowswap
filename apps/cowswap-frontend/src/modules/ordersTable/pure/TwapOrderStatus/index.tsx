import React, { ReactNode } from 'react'

import { Check, Clock, X } from 'react-feather'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

// TODO: make CancelledDisplay, FilledDisplay, ExpiredDisplay common
import * as styledEl from '../../containers/OrderRow/styled'
import { getTwapOrderStatus, TwapOrderStatusValues } from '../../utils/getTwapOrderStatus'

export interface FillsAtStatusProps {
  childOrders?: ParsedOrder[]
  orderStatus: OrderStatus
  children: ReactNode
}

export function TwapOrderStatus({ childOrders, orderStatus, children }: FillsAtStatusProps) {
  if (!childOrders) return null

  const twapOrderStatus = getTwapOrderStatus(childOrders, orderStatus)
  switch (twapOrderStatus) {
    case TwapOrderStatusValues.CANCELLED:
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
    case TwapOrderStatusValues.SCHEDULED:
      return (
        <>
          <b>-</b>
          <i></i>
        </>
      )
    case TwapOrderStatusValues.FILLED:
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
    case TwapOrderStatusValues.PARTIALLY_FILLED:
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
    case TwapOrderStatusValues.EXPIRED:
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
    default:
      return children
  }
}

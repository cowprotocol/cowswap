import React from 'react'

import type { Token } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

import { WarningTooltip } from '../OrdersTableContainer/OrderRow/OrderWarning'
import { OrderStatusBox } from '../OrderStatusBox'

import type { OrderParams } from '../../utils/getOrderParams'

interface ChildOrderItems {
  order: ParsedOrder
  orderParams: OrderParams
}

interface TwapStatusAndToggleProps {
  parent: ParsedOrder
  childrenLength: number
  isCollapsed: boolean
  onToggle: () => void
  onClick: () => void
  childOrders: ChildOrderItems[]
  approveOrderToken(token: Token): void
}

export function TwapStatusAndToggle({
  parent,
  childrenLength,
  isCollapsed,
  onToggle,
  onClick,
  childOrders,
  approveOrderToken,
}: TwapStatusAndToggleProps) {
  // Get the first child with a warning to use its parameters
  const childWithWarning = childOrders.find(
    (child) =>
      (child.orderParams?.hasEnoughBalance === false || child.orderParams?.hasEnoughAllowance === false) &&
      (child.order.status === OrderStatus.PENDING || child.order.status === OrderStatus.SCHEDULED),
  )

  const hasChildWithWarning = !!childWithWarning

  return (
    <>
      <OrderStatusBox
        order={parent}
        onClick={onClick}
        withWarning={hasChildWithWarning}
        WarningTooltip={
          hasChildWithWarning && childWithWarning
            ? ({ children }) => (
                <WarningTooltip
                  children={children}
                  hasEnoughBalance={childWithWarning.orderParams.hasEnoughBalance ?? false}
                  hasEnoughAllowance={childWithWarning.orderParams.hasEnoughAllowance ?? false}
                  inputTokenSymbol={childWithWarning.order.inputToken.symbol || ''}
                  isOrderScheduled={childWithWarning.order.status === OrderStatus.SCHEDULED}
                  onApprove={() => approveOrderToken(childWithWarning.order.inputToken)}
                  showIcon
                />
              )
            : undefined
        }
      />
      <styledEl.ToggleExpandButton onClick={onToggle} isCollapsed={isCollapsed}>
        {childrenLength && (
          <i>
            {childrenLength} part{childrenLength > 1 && 's'}
          </i>
        )}
        <button />
      </styledEl.ToggleExpandButton>
    </>
  )
}

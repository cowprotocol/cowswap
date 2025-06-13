import React from 'react'

import type { Token } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

import { WarningTooltip } from '../../containers/OrderRow/OrderWarning'
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TwapStatusAndToggle({
  parent,
  childrenLength,
  isCollapsed,
  onToggle,
  onClick,
  childOrders,
  approveOrderToken,
}: TwapStatusAndToggleProps) {
  // Check if any child has insufficient balance or allowance
  const childWithAllowanceWarning = childOrders.find(
    (child) =>
      child.orderParams?.hasEnoughAllowance === false &&
      (child.order.status === OrderStatus.PENDING || child.order.status === OrderStatus.SCHEDULED),
  )

  const childWithBalanceWarning = childOrders.find(
    (child) =>
      child.orderParams?.hasEnoughBalance === false &&
      (child.order.status === OrderStatus.PENDING || child.order.status === OrderStatus.SCHEDULED),
  )

  const warningChild = childWithAllowanceWarning || childWithBalanceWarning

  return (
    <>
      <OrderStatusBox
        order={parent}
        onClick={onClick}
        withWarning={!!warningChild}
        WarningTooltip={
          warningChild ? (
            <WarningTooltip
              hasEnoughBalance={!childWithBalanceWarning}
              hasEnoughAllowance={!childWithAllowanceWarning}
              inputTokenSymbol={warningChild.order.inputToken.symbol || ''}
              isOrderScheduled={warningChild.order.status === OrderStatus.SCHEDULED}
              onApprove={() => approveOrderToken(warningChild.order.inputToken)}
            />
          ) : null
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

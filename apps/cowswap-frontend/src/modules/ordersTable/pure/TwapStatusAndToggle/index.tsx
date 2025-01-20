import React from 'react'

import { OrderStatus } from 'legacy/state/orders/actions'

import * as styledEl from './styled'

import { WarningTooltip } from '../OrdersTableContainer/OrderRow/OrderWarning'
import { OrderStatusBox } from '../OrderStatusBox'

export function TwapStatusAndToggle({
  parent,
  childrenLength,
  isCollapsed,
  onToggle,
  onClick,
  children,
}: {
  parent: any
  childrenLength: number
  isCollapsed: boolean
  onToggle: () => void
  onClick: () => void
  children: any[]
}) {
  // Get the first child with a warning to use its parameters
  const childWithWarning = children.find(
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
                  onApprove={() => childWithWarning.orderActions.approveOrderToken(childWithWarning.order.inputToken)}
                  showIcon={true}
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

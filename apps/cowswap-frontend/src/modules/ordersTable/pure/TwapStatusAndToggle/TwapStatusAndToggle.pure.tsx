import React from 'react'

import type { Token } from '@cowprotocol/currency'

import { Trans } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './TwapStatusAndToggle.styled'

import { FallbackHandlerWarningTooltip, WarningTooltip } from '../OrdersTable/Row/WarningTooltip/WarningTooltip.pure'
import { OrderStatusBox } from '../OrderStatusBox/OrderStatusBox.pure'

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

  // A still-open parent or part carrying `isUnfillable` is blocked by a reset Safe ComposableCoW
  // fallback handler (see issue #5426). Surface the same danger design on the parent status badge
  // so it matches the reason shown in the Fills-at column and on the individual parts.
  const isFallbackHandlerUnfillable = (order: ParsedOrder): boolean =>
    order.isUnfillable === true && (order.status === OrderStatus.PENDING || order.status === OrderStatus.SCHEDULED)

  const isFallbackHandlerBlocked =
    isFallbackHandlerUnfillable(parent) || childOrders.some((child) => isFallbackHandlerUnfillable(child.order))

  return (
    <>
      <OrderStatusBox
        order={parent}
        onClick={onClick}
        withWarning={!!warningChild || isFallbackHandlerBlocked}
        WarningTooltip={
          isFallbackHandlerBlocked ? (
            <FallbackHandlerWarningTooltip />
          ) : warningChild ? (
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
            {childrenLength} {childrenLength > 1 ? <Trans>parts</Trans> : <Trans>part</Trans>}
          </i>
        )}
        <button />
      </styledEl.ToggleExpandButton>
    </>
  )
}

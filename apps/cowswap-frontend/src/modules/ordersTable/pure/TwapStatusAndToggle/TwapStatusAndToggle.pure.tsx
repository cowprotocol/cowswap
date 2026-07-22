import React from 'react'

import type { Token } from '@cowprotocol/currency'

import { Trans } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './TwapStatusAndToggle.styled'

import { getIsFallbackHandlerUnfillable } from '../../utils/getIsFallbackHandlerUnfillable'
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
  isFallbackHandlerRequired?: boolean
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
  isFallbackHandlerRequired,
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

  // A reset Safe ComposableCoW fallback handler blocks a still-open order (see issue #5426). This is
  // a per-account state (resolved in the view, not persisted onto the order); the parent status
  // already reflects whether the TWAP is still open, so checking it is enough — surface the same
  // danger design on the parent badge as the Fills-at column and the parts.
  const isFallbackHandlerBlocked = getIsFallbackHandlerUnfillable(parent.status, !!isFallbackHandlerRequired)

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

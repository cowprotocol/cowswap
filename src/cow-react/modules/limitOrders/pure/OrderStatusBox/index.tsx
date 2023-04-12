import styled from 'styled-components/macro'
import { OrderStatus } from 'state/orders/actions'
import { orderStatusTitleMap } from '@cow/modules/limitOrders/pure/Orders/OrderRow'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

const Wrapper = styled.div<{
  status: OrderStatus
  partiallyFilled: boolean
  cancelling?: boolean
  withWarning?: boolean
  widthAuto?: boolean
}>`
  --height: 28px;
  --statusColor: ${({ theme, status, cancelling, partiallyFilled }) =>
    cancelling
      ? theme.text1
      : status === OrderStatus.CANCELLED
      ? theme.danger
      : status === OrderStatus.FULFILLED || partiallyFilled
      ? theme.success
      : status === OrderStatus.PENDING // OPEN order
      ? theme.text3
      : status === OrderStatus.EXPIRED
      ? theme.warning
      : status === OrderStatus.FAILED
      ? theme.danger
      : // Remaining statuses should use the same
        // OrderStatus.CREATING || OrderStatus.PRESIGNATURE_PENDING
        theme.text1};

  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--statusColor);
  padding: 0 10px;
  position: relative;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  height: var(--height);
  width: ${({ widthAuto }) => (widthAuto ? 'auto' : '100%')};

  &::before {
    content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    display: block;
    left: 0;
    top: 0;
    background: var(--statusColor);
    opacity: 0.14;
    z-index: 1;
    border-radius: ${({ withWarning }) => (withWarning ? '9px 0 0 9px' : '9px')};
  }
`

export type OrderStatusBoxProps = { order: ParsedOrder; widthAuto?: boolean; withWarning?: boolean }

export function OrderStatusBox({ order, widthAuto, withWarning }: OrderStatusBoxProps) {
  return (
    <Wrapper
      cancelling={order.isCancelling}
      partiallyFilled={order.partiallyFilled}
      status={order.status}
      widthAuto={widthAuto}
      withWarning={withWarning}
    >
      {/* Status overrides for special cases */}
      {
        // Cancelling is not a real order status
        order.isCancelling
          ? 'Cancelling...'
          : // Cancelled status takes precedence
          order.status === OrderStatus.CANCELLED
          ? orderStatusTitleMap[order.status]
          : // We consider the order fully filled for display purposes even if not 100% filled
          // For this reason we use the flag to override the order status
          order.fullyFilled
          ? orderStatusTitleMap[OrderStatus.FULFILLED]
          : // Partially filled is also not a real status
          order.partiallyFilled
          ? 'Partially Filled'
          : orderStatusTitleMap[order.status] // Finally, map order status to their display version
      }
    </Wrapper>
  )
}

import { useContext } from 'react'

import styled, { ThemeContext, DefaultTheme } from 'styled-components/macro'

import { CONFIRMED_STATES, OrderStatus } from 'legacy/state/orders/actions'

import { orderStatusTitleMap } from 'modules/ordersTable/pure/OrdersTableContainer/OrderRow'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

const Wrapper = styled.div<{
  color: string
  withWarning?: boolean
  widthAuto?: boolean
  clickable?: boolean
}>`
  --height: 28px;
  --statusColor: ${({ color }) => color};

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
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

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

function getOrderStatusTitleAndColor(order: ParsedOrder, theme: DefaultTheme): { title: string; color: string } {
  // We consider the order fully filled for display purposes even if not 100% filled
  // For this reason we use the flag to override the order status
  if (order.executionData.fullyFilled || order.status === OrderStatus.FULFILLED) {
    return {
      title: orderStatusTitleMap[OrderStatus.FULFILLED],
      color: theme.success,
    }
  }

  if (CONFIRMED_STATES.includes(order.status)) {
    return {
      title: orderStatusTitleMap[order.status],
      color: order.status === OrderStatus.EXPIRED ? theme.warning : theme.danger,
    }
  }

  // Cancelling is not a real order status
  if (order.isCancelling) {
    return {
      title: 'Cancelling...',
      color: theme.text1,
    }
  }

  // Partially filled is also not a real status
  if (order.executionData.partiallyFilled) {
    return {
      title: 'Partially Filled',
      color: theme.success,
    }
  }

  // Finally, map order status to their display version
  return {
    title: orderStatusTitleMap[order.status],
    color: order.status === OrderStatus.PENDING ? theme.text3 : theme.text1,
  }
}

export type OrderStatusBoxProps = {
  order: ParsedOrder
  widthAuto?: boolean
  withWarning?: boolean
  onClick?: () => void
}

export function OrderStatusBox({ order, widthAuto, withWarning, onClick }: OrderStatusBoxProps) {
  const theme = useContext(ThemeContext)
  const { title, color } = getOrderStatusTitleAndColor(order, theme)
  return (
    <Wrapper color={color} widthAuto={widthAuto} withWarning={withWarning} clickable={!!onClick} onClick={onClick}>
      {/* Status overrides for special cases */}
      {title}
    </Wrapper>
  )
}

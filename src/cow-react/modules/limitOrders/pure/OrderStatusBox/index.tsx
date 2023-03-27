import styled from 'styled-components/macro'
import { OrderStatus } from 'state/orders/actions'

export const OrderStatusBox = styled.div<{ status: OrderStatus; cancelling: boolean; withWarning?: boolean }>`
  --height: 28px;
  --statusColor: ${({ theme, status, cancelling }) =>
    cancelling
      ? theme.text1
      : status === OrderStatus.PENDING // OPEN order
      ? theme.text3
      : status === OrderStatus.PRESIGNATURE_PENDING
      ? theme.text1
      : status === OrderStatus.FULFILLED
      ? theme.success
      : status === OrderStatus.EXPIRED
      ? theme.warning
      : status === OrderStatus.CANCELLED
      ? theme.danger
      : status === OrderStatus.FAILED
      ? theme.danger
      : status === (OrderStatus.CREATING || OrderStatus.PRESIGNATURE_PENDING || OrderStatus)
      ? theme.text1
      : theme.text1};

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
  width: 100%;

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

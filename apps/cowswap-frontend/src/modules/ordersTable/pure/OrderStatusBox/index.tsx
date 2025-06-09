import { ReactNode } from 'react'

import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { Command } from '@cowprotocol/types'

import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderStatusTitleAndColor } from './getOrderStatusTitleAndColor'

const shimmerAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

const Wrapper = styled.div<{
  color: string
  background: string
  withWarning?: boolean
  widthAuto?: boolean
  clickable?: boolean
  isCancelling?: boolean
  isSigning?: boolean
}>`
  --height: 26px;
  --statusColor: ${({ color }) => color};
  --statusBackground: ${({ background }) => background};

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
    background: var(--statusBackground);
    z-index: 1;
    border-radius: 16px;
  }

  ${({ isCancelling, isSigning }) =>
    (isCancelling || isSigning) &&
    css`
      overflow: hidden;
      border-radius: 16px;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        animation: ${shimmerAnimation} 1.5s infinite;
        z-index: 2;
        border-radius: 16px;
      }
    `}
`

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
  white-space: nowrap;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  svg > path {
    fill: currentColor;
  }
`

type OrderStatusBoxProps = {
  order: ParsedOrder
  widthAuto?: boolean
  withWarning?: boolean
  onClick?: Command
  WarningTooltip?: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderStatusBox({ order, widthAuto, withWarning, onClick, WarningTooltip }: OrderStatusBoxProps) {
  const { title, color, background } = getOrderStatusTitleAndColor(order)

  const content = (
    <StatusContent>
      {withWarning && WarningTooltip}
      {order.status === OrderStatus.PRESIGNATURE_PENDING && (
        <SVG src={orderPresignaturePending} description="signing" />
      )}
      {title}
    </StatusContent>
  )

  return (
    <Wrapper
      color={color}
      background={background}
      widthAuto={widthAuto}
      withWarning={withWarning}
      clickable={!!onClick}
      onClick={onClick}
      isCancelling={order.isCancelling && !order.executionData.fullyFilled}
      isSigning={order.status === OrderStatus.PRESIGNATURE_PENDING}
    >
      {content}
    </Wrapper>
  )
}

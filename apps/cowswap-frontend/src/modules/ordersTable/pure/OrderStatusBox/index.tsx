import { ReactNode } from 'react'

import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
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
  --height: 32px;
  --statusColor: ${({ color }) => color};
  --statusBackground: ${({ background }) => background};

  align-items: center;
  color: var(--statusColor);
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
  display: flex;
  font-size: 12px;
  font-weight: 600;
  height: var(--height);
  justify-content: center;
  padding: 0 10px;
  position: relative;
  width: ${({ widthAuto }) => (widthAuto ? 'auto' : '100%')};
  z-index: 2;

  &::before {
    background: var(--statusBackground);
    border-radius: 16px;
    content: '';
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
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
  hyphens: auto;
  line-height: 1.1;
  overflow-wrap: normal;
  position: relative;
  text-align: center;
  word-break: normal;
  z-index: 2;

  svg {
    fill: currentColor;
    height: 14px;
    width: 14px;
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
        <SVG src={orderPresignaturePending} description={t`signing`} />
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

import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { Command } from '@cowprotocol/types'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderStatusTitleAndColor } from './getOrderStatusTitleAndColor'

const Wrapper = styled.div<{
  color: string
  background: string
  withWarning?: boolean
  widthAuto?: boolean
  clickable?: boolean
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
`

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;

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
  WarningTooltip?: React.ComponentType<{ children: React.ReactNode }>
}

export function OrderStatusBox({ order, widthAuto, withWarning, onClick, WarningTooltip }: OrderStatusBoxProps) {
  const { title, color, background } = getOrderStatusTitleAndColor(order)

  const content = (
    <StatusContent>
      {withWarning && WarningTooltip && <WarningTooltip>{null}</WarningTooltip>}
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
    >
      {content}
    </Wrapper>
  )
}

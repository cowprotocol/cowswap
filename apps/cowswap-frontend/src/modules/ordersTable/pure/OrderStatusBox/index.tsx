import { Command } from '@cowprotocol/types'

import styled from 'styled-components/macro'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderStatusTitleAndColor } from './getOrderStatusTitleAndColor'

const Wrapper = styled.div<{
  color: string
  background: string
  withWarning?: boolean
  widthAuto?: boolean
  clickable?: boolean
}>`
  --height: 28px;
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
    /* opacity: 0.14; */
    z-index: 1;
    border-radius: ${({ withWarning }) => (withWarning ? '9px 0 0 9px' : '9px')};
  }
`

type OrderStatusBoxProps = {
  order: ParsedOrder
  widthAuto?: boolean
  withWarning?: boolean
  onClick?: Command
}

export function OrderStatusBox({ order, widthAuto, withWarning, onClick }: OrderStatusBoxProps) {
  const { title, color, background } = getOrderStatusTitleAndColor(order)
  return (
    <Wrapper
      color={color}
      background={background}
      widthAuto={widthAuto}
      withWarning={withWarning}
      clickable={!!onClick}
      onClick={onClick}
    >
      {/* Status overrides for special cases */}
      {title}
    </Wrapper>
  )
}

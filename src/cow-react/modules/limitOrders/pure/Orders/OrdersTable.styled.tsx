import { OrderStatus } from 'state/orders/actions'
import CurrencyLogo from 'components/CurrencyLogo'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { formatSmart } from 'utils/format'
import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  /* border: 1px solid ${({ theme }) => transparentize(0.8, theme.text1)}; */
`

export const Header = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 120px;
  align-items: center;
  border-top: 1px solid transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text1)};

  > div {
    padding: 12px 16px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 400;
  }
`

export const Rows = styled.div`
  display: block;
`

export const Row = styled(Header)`
  > div {
    font-size: 13px;
  }

  &:last-child {
    border-bottom: 0;
  }
`

export const StatusItem = styled.div<{ status: OrderStatus; cancelling: boolean }>`
  /* [OrderStatus.PENDING]: '#badbe8', // = OPEN order state
  [OrderStatus.PRESIGNATURE_PENDING]: '#badbe8',
  [OrderStatus.EXPIRED]: '#eeaaaa',
  [OrderStatus.FULFILLED]: '#d5eab3',
  [OrderStatus.CANCELLED]: '#fcecb4',
  // TODO: decide what color for each state
  [OrderStatus.CREATING]: '#badbe8',
  [OrderStatus.REFUNDED]: '#eeaaaa',
  [OrderStatus.REFUNDING]: '#eeaaaa',
  [OrderStatus.REJECTED]: '#eeaaaa', */

  --statusColor: ${({ theme, status, cancelling }) =>
    cancelling
      ? theme.pending
      : status === OrderStatus.PENDING // OPEN order
      ? theme.pending
      : status === OrderStatus.PRESIGNATURE_PENDING // SIGNING order
      ? theme.pending
      : status === OrderStatus.FULFILLED // FILLED order
      ? theme.success
      : status === OrderStatus.EXPIRED // EXPIRED order
      ? theme.cancelled
      : status === OrderStatus.CREATING // CREATING order
      ? theme.pending
      : theme.pending};

  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--statusColor);
  padding: 5px 10px;
  border-radius: 3px;
  position: relative;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;

  &::before {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    display: block
    left: 0;
    top: 0;
    background: var(--statusColor);
    opacity: 0.10;
    z-index: 1;
    border-radius: 9px;
  }
`

export const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
`

export const RateValue = styled.span``

export function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <AmountItem title={amount.toExact() + ' ' + amount.currency.symbol}>
      <div>
        <CurrencyLogo currency={amount.currency} size="24px" />
      </div>
      <span>{formatSmart(amount)}</span>
      <span>{amount.currency.symbol}</span>
    </AmountItem>
  )
}

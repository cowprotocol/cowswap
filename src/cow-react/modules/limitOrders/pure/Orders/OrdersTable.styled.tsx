import { OrderStatus } from 'state/orders/actions'
import CurrencyLogo from 'components/CurrencyLogo'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { formatSmart } from 'utils/format'
import styled from 'styled-components/macro'
import { transparentize } from 'polished'

const statusColorMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: '#badbe8',
  [OrderStatus.PRESIGNATURE_PENDING]: '#badbe8',
  [OrderStatus.EXPIRED]: '#eeaaaa',
  [OrderStatus.FULFILLED]: '#d5eab3',
  [OrderStatus.CANCELLED]: '#fcecb4',
  // TODO: decide what color for each state
  [OrderStatus.CREATING]: '#badbe8',
  [OrderStatus.REFUNDED]: '#eeaaaa',
  [OrderStatus.REFUNDING]: '#eeaaaa',
  [OrderStatus.REJECTED]: '#eeaaaa',
}

export const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  /* border: 1px solid ${({ theme }) => transparentize(0.8, theme.text1)}; */
`

export const Header = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  display: inline-block;
  background: ${({ status, cancelling }) => (cancelling ? statusColorMap.cancelled : statusColorMap[status])};
  color: ${({ theme }) => theme.text2};
  padding: 5px 10px;
  border-radius: 3px;
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

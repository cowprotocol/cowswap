import { OrderStatus } from 'state/orders/actions'
import CurrencyLogo from 'components/CurrencyLogo'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { formatSmart } from 'utils/format'
import styled from 'styled-components/macro'

const statusColorMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: '#badbe8',
  [OrderStatus.PRESIGNATURE_PENDING]: '#badbe8',
  [OrderStatus.EXPIRED]: '#eeaaaa',
  [OrderStatus.FULFILLED]: '#d5eab3',
  [OrderStatus.CANCELLED]: '#fcecb4',
}

export const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.border2};
`

export const Header = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  border-bottom: 2px solid ${({ theme }) => theme.border2};

  > div {
    padding: 12px;
  }
`

export const Rows = styled.div`
  display: block;
`

export const Row = styled(Header)`
  :last-child {
    border-bottom: 0;
  }
`

export const StatusItem = styled.div<{ status: OrderStatus }>`
  display: inline-block;
  background: ${({ status }) => statusColorMap[status]};
  padding: 5px 10px;
  border-radius: 3px;
`

export const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <AmountItem>
      <CurrencyLogo currency={amount.currency} size="24px" />
      <span>{formatSmart(amount)}</span>
      <span>{amount.currency.symbol}</span>
    </AmountItem>
  )
}

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
  // TODO: decide what color for each state
  [OrderStatus.CREATING]: '#badbe8',
  [OrderStatus.REFUNDED]: '#eeaaaa',
  [OrderStatus.REFUNDING]: '#eeaaaa',
  [OrderStatus.REJECTED]: '#eeaaaa',
}

export const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.border2};
`

export const Header = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  border-bottom: 2px solid ${({ theme }) => theme.border2};

  > div {
    padding: 12px;
    overflow: hidden;
    font-size: 14px;
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

export const StatusBox = styled.div`
  display: flex;
  align-items: center;
`

export const StatusItem = styled.div<{ status: OrderStatus; cancelling: boolean; withWarning: boolean }>`
  display: inline-block;
  background: ${({ status, cancelling }) => (cancelling ? statusColorMap.cancelled : statusColorMap[status])};
  color: ${({ theme }) => theme.text2};
  padding: 5px 10px;
  border-radius: ${({ withWarning }) => (withWarning ? '4px 0 0 4px' : '4px')};
`

export const WarningIndicator = styled.button`
  margin: 0;
  padding: 0;
  background: #ffcb67;
  color: ${({ theme }) => theme.warningText};
  line-height: 0;
  border: 0;
  height: 27px;
  width: 27px;
  border-radius: 0 4px 4px 0;
`

export const WarningContent = styled.div`
  max-width: 450px;
  padding: 15px 20px;
  color: ${({ theme }) => theme.black};

  h3,
  p {
    margin: 0;
  }

  h3 {
    margin-bottom: 8px;
  }
`

export const WarningParagraph = styled.div`
  margin-bottom: 20px;

  :last-child {
    margin-bottom: 0;
  }
`

export const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
`

export const RateValue = styled.span`
  font-size: 12px;
`

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

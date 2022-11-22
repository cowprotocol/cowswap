import { formatSmart } from 'utils/format'
import styled, { DefaultTheme, StyledComponent } from 'styled-components/macro'
import { Order, OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/CurrencyLogo'
import { ActiveRateDisplay } from '../../hooks/useActiveRateDisplay'
import { RateInfo } from '../RateInfo'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

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

const orderStatusTitleMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Open',
  [OrderStatus.PRESIGNATURE_PENDING]: 'Signing',
  [OrderStatus.FULFILLED]: 'Filled',
  [OrderStatus.EXPIRED]: 'Expired',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CREATING]: 'Creating',
  [OrderStatus.REFUNDED]: 'Expired',
  [OrderStatus.REFUNDING]: 'Expired',
  [OrderStatus.REJECTED]: 'Expired',
}

const RateValue = styled.span`
  font-size: 12px;
`

const StatusItem = styled.div<{ status: OrderStatus; cancelling: boolean }>`
  display: inline-block;
  background: ${({ status, cancelling }) => (cancelling ? statusColorMap.cancelled : statusColorMap[status])};
  color: ${({ theme }) => theme.text2};
  padding: 5px 10px;
  border-radius: 3px;
`

const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
`

function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
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

export interface OrderRowProps {
  chainId: SupportedChainId | undefined
  order: Order
  RowElement: StyledComponent<'div', DefaultTheme>
  isRateInversed: boolean
}

export function OrderRow({ chainId, order, RowElement, isRateInversed }: OrderRowProps) {
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
  const activeRate = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())

  const activeRateDisplay: ActiveRateDisplay = {
    chainId,
    activeRate,
    inputCurrencyAmount: sellAmount,
    outputCurrencyAmount: buyAmount,
    activeRateFiatAmount: null,
    inversedActiveRateFiatAmount: null,
  }

  return (
    <RowElement>
      <div>
        <CurrencyAmountItem amount={sellAmount} />
      </div>
      <div>
        <CurrencyAmountItem amount={buyAmount} />
      </div>
      <div>
        <RateValue>
          <RateInfo noLabel={true} isInversed={isRateInversed} activeRateDisplay={activeRateDisplay} />
        </RateValue>
      </div>
      <div>
        <StatusItem cancelling={!!order.isCancelling} status={order.status}>
          {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
        </StatusItem>
      </div>
    </RowElement>
  )
}

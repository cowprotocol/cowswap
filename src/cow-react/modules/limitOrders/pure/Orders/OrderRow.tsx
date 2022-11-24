import { formatSmart } from 'utils/format'
import styled, { DefaultTheme, StyledComponent } from 'styled-components/macro'
import { Order, OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/CurrencyLogo'
import { ActiveRateDisplay } from '../../hooks/useActiveRateDisplay'
import { RateInfo } from '../RateInfo'
import { BalancesAndAllowances } from '../../containers/OrdersWidget/hooks/useOrdersBalancesAndAllowances'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { AlertTriangle, Trash2 } from 'react-feather'
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

const StatusBox = styled.div`
  display: flex;
  align-items: center;
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

const WarningIndicator = styled.button`
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

const WarningContent = styled.div`
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

const WarningParagraph = styled.div`
  margin-bottom: 20px;

  :last-child {
    margin-bottom: 0;
  }
`

const CancelOrderBtn = styled.button`
  background: none;
  border: 0;
  outline: none;
  margin: 0 auto;
  border-radius: 3px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  width: 32px;
  height: 32px;

  :hover {
    background: ${({ theme }) => transparentize(0.9, theme.black)};
  }
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

// TODO: check texts with marketing
const balanceWarning = (tokenSymbol: string) => (
  <WarningParagraph>
    <h3>Insufficient balance for this limit order</h3>
    <p>
      This order is still open and valid but your account currently has insufficient <strong>{tokenSymbol}</strong>{' '}
      balance. <br />
      Your order therefore can&apos;t be matched.
    </p>
  </WarningParagraph>
)

const allowanceWarning = (tokenSymbol: string) => (
  <WarningParagraph>
    <h3>Insufficient allowance for this limit order</h3>
    <p>
      This order is still open and valid but your account currently has insufficient allowance to spend{' '}
      <strong>{tokenSymbol}</strong>. <br />
      Your order therefore can&apos;t be matched.
    </p>
  </WarningParagraph>
)

export interface OrderRowProps {
  order: Order
  balancesAndAllowances: BalancesAndAllowances
  RowElement: StyledComponent<'div', DefaultTheme>
  isRateInversed: boolean
  showOrderCancelationModal(order: Order): void
}

function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  targetAmount: CurrencyAmount<Currency> | undefined
): boolean {
  if (!targetAmount) return true

  if (targetAmount.equalTo(sellAmount)) return true

  return sellAmount.lessThan(targetAmount)
}

export function OrderRow({
  order,
  RowElement,
  balancesAndAllowances,
  isRateInversed,
  showOrderCancelationModal,
}: OrderRowProps) {
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
  const activeRate = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())
  const activeRateDisplay: ActiveRateDisplay = {
    activeRate,
    inputCurrency: order.inputToken,
    outputCurrency: order.outputToken,
    activeRateFiatAmount: null,
    inversedActiveRateFiatAmount: null,
  }

  const { balances, allowances } = balancesAndAllowances
  const balance = balances[order.inputToken.address]
  const allowance = allowances[order.inputToken.address]

  const hasEnoughBalance = isEnoughAmount(sellAmount, balance)
  const hasEnoughAllowance = isEnoughAmount(sellAmount, allowance)
  const withWarning = !hasEnoughBalance || !hasEnoughAllowance

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
        <StatusBox>
          <StatusItem cancelling={!!order.isCancelling} status={order.status}>
            {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
          </StatusItem>
          {withWarning && (
            <WarningIndicator>
              <MouseoverTooltipContent
                wrap={false}
                bgColor={'#ffcb67'}
                content={
                  <WarningContent>
                    {!hasEnoughBalance && balanceWarning(order.inputToken.symbol || '')}
                    {!hasEnoughAllowance && allowanceWarning(order.inputToken.symbol || '')}
                  </WarningContent>
                }
                placement="bottom"
              >
                <AlertTriangle size={16} />
              </MouseoverTooltipContent>
            </WarningIndicator>
          )}
        </StatusBox>
      </div>
      <div>
        {order.status === OrderStatus.PENDING && !order.isCancelling && (
          <CancelOrderBtn onClick={() => showOrderCancelationModal(order)}>
            <Trash2 size={16} />
          </CancelOrderBtn>
        )}
      </div>
    </RowElement>
  )
}

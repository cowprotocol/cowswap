import { formatSmart } from 'utils/format'
import styled, { DefaultTheme, StyledComponent } from 'styled-components/macro'
import { Order, OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/CurrencyLogo'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { AlertTriangle, Trash2 } from 'react-feather'
import { transparentize } from 'polished'
import { OrderParams } from './utils/getOrderParams'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'

export const orderStatusTitleMap: { [key in OrderStatus]: string } = {
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

const RateValue = styled.span``

const StatusBox = styled.div`
  display: flex;
  align-items: center;
`

export const StatusItem = styled.div<{ status: OrderStatus; cancelling: boolean }>`
  --statusColor: ${({ theme, status, cancelling }) =>
    cancelling
      ? theme.text1
      : status === OrderStatus.PENDING // OPEN order
      ? theme.text3
      : status === OrderStatus.PRESIGNATURE_PENDING
      ? theme.text1
      : status === OrderStatus.FULFILLED
      ? theme.success
      : status === OrderStatus.EXPIRED
      ? theme.warning
      : status === (OrderStatus.CANCELLED || OrderStatus.REJECTED)
      ? theme.danger
      : status === OrderStatus.REFUNDED
      ? theme.text3
      : status === (OrderStatus.CREATING || OrderStatus.PRESIGNATURE_PENDING || OrderStatus.REFUNDING)
      ? theme.text1
      : theme.text1};

  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--statusColor);
  padding: 7px 10px;
  border-radius: 3px;
  position: relative;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  width: 100%;

  &::before {
    content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    display: block;
    left: 0;
    top: 0;
    background: var(--statusColor);
    opacity: 0.14;
    z-index: 1;
    border-radius: 9px;
  }
`

const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  > div {
    display: flex;
    align-items: center;
  }
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

const balanceWarning = (tokenSymbol: string) => (
  <WarningParagraph>
    <h3>Insufficient balance for this limit order</h3>
    <p>
      Your wallet currently has insufficient <strong>{tokenSymbol}</strong> balance to execute this order.
      <br />
      The order is still open and will become executable when you top up your <strong>{tokenSymbol}</strong> balance.
    </p>
  </WarningParagraph>
)

const allowanceWarning = (tokenSymbol: string) => (
  <WarningParagraph>
    <h3>Insufficient approval for this limit order</h3>
    <p>
      This order is still open and valid, but you haven’t given CoW Swap sufficient allowance to spend{' '}
      <strong>{tokenSymbol}</strong>.
      <br />
      The order will become executable when you approve <strong>{tokenSymbol}</strong> in your account token page.
    </p>
  </WarningParagraph>
)

export interface OrderRowProps {
  order: Order
  RowElement: StyledComponent<'div', DefaultTheme>
  isRateInversed: boolean
  orderParams: OrderParams
  onClick: () => void
  showOrderCancelationModal(order: Order): void
}

export function OrderRow({
  order,
  RowElement,
  isRateInversed,
  showOrderCancelationModal,
  orderParams,
  onClick,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance } = orderParams

  const withWarning = !hasEnoughBalance || !hasEnoughAllowance

  return (
    <RowElement onClick={onClick}>
      <div>
        <CurrencyAmountItem amount={getSellAmountWithFee(order)} />
      </div>
      <div>
        <CurrencyAmountItem amount={buyAmount} />
      </div>
      <div>
        <RateValue>
          <RateInfo noLabel={true} isInversed={isRateInversed} rateInfoParams={rateInfoParams} />
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
          <CancelOrderBtn
            title="Cancel order"
            onClick={(event) => {
              event.stopPropagation()
              showOrderCancelationModal(order)
            }}
          >
            <Trash2 size={16} />
          </CancelOrderBtn>
        )}
      </div>
    </RowElement>
  )
}

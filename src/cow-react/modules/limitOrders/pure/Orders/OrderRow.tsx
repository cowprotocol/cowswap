import { useContext } from 'react'
import { formatSmart } from 'utils/format'
import styled, { DefaultTheme, StyledComponent, ThemeContext } from 'styled-components/macro'
import { Order, OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/CurrencyLogo'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { Trash2 } from 'react-feather'
import { transparentize } from 'polished'
import { OrderParams } from './utils/getOrderParams'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'
import AlertTriangle from 'assets/cow-swap/alert.svg'
import SVG from 'react-inlinesvg'

export const orderStatusTitleMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Open',
  [OrderStatus.PRESIGNATURE_PENDING]: 'Signing',
  [OrderStatus.FULFILLED]: 'Filled',
  [OrderStatus.EXPIRED]: 'Expired',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CREATING]: 'Creating',
  [OrderStatus.FAILED]: 'Failed',
}

const RateValue = styled.span``

const StatusBox = styled.div`
  display: flex;
  align-items: center;
`

export const StatusItem = styled.div<{ status: OrderStatus; cancelling: boolean; withWarning?: boolean }>`
  --height: 28px;
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
      : status === OrderStatus.CANCELLED
      ? theme.danger
      : status === OrderStatus.FAILED
      ? theme.danger
      : status === (OrderStatus.CREATING || OrderStatus.PRESIGNATURE_PENDING || OrderStatus)
      ? theme.text1
      : theme.text1};

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
    border-radius: ${({ withWarning }) => (withWarning ? '9px 0 0 9px' : '9px')};
  }
`

const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    white-space: normal;
  `};

  > div {
    display: flex;
    align-items: center;
  }

  > span {
    white-space: normal;
    word-break: break-all;
  }
`

const WarningIndicator = styled.button`
  --height: 28px;
  margin: 0;
  background: ${({ theme }) => (theme.darkMode ? transparentize(0.9, theme.alert) : transparentize(0.85, theme.alert))};
  color: ${({ theme }) => theme.alert};
  line-height: 0;
  border: 0;
  padding: 0 5px;
  width: auto;
  height: var(--height);
  border-radius: 0 9px 9px 0;

  svg > path {
    fill: ${({ theme }) => theme.alert};
  }
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
      <span>
        {formatSmart(amount)} {amount.currency.symbol}
      </span>
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
  getShowCancellationModal(order: Order): (() => void) | null
}

export function OrderRow({
  order,
  RowElement,
  isRateInversed,
  getShowCancellationModal,
  orderParams,
  onClick,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance } = orderParams

  const showCancellationModal = getShowCancellationModal(order)

  const withWarning = !hasEnoughBalance || !hasEnoughAllowance
  const theme = useContext(ThemeContext)

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
          <StatusItem cancelling={!!order.isCancelling} status={order.status} withWarning={withWarning}>
            {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
          </StatusItem>
          {withWarning && (
            <WarningIndicator>
              <MouseoverTooltipContent
                wrap={false}
                bgColor={theme.alert}
                content={
                  <WarningContent>
                    {!hasEnoughBalance && balanceWarning(order.inputToken.symbol || '')}
                    {!hasEnoughAllowance && allowanceWarning(order.inputToken.symbol || '')}
                  </WarningContent>
                }
                placement="bottom"
              >
                <SVG src={AlertTriangle} description="Alert" width="14" height="13" />
              </MouseoverTooltipContent>
            </WarningIndicator>
          )}
        </StatusBox>
      </div>
      <div>
        {showCancellationModal && (
          <CancelOrderBtn
            title="Cancel order"
            onClick={(event) => {
              event.stopPropagation()
              showCancellationModal()
            }}
          >
            <Trash2 size={16} />
          </CancelOrderBtn>
        )}
      </div>
    </RowElement>
  )
}

import { useContext } from 'react'
import styled, { DefaultTheme, StyledComponent, ThemeContext } from 'styled-components/macro'
import { Order, OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { Trash2 } from 'react-feather'
import { transparentize } from 'polished'
import { OrderParams } from './utils/getOrderParams'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'
import AlertTriangle from 'assets/cow-swap/alert.svg'
import SVG from 'react-inlinesvg'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import CurrencyLogo from 'components/CurrencyLogo'

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
  width: 100%;
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

const CellElement = styled.div<{ doubleRow?: boolean}>`
  padding: 12px 0;
  font-size: 13px;
  font-weight: 500;
  display: flex;

  > b {
    font-weight: 500;
  }

  ${({ doubleRow }) => doubleRow && `
    flex-flow: column wrap;
    gap: 2px;

    > i {
      opacity: 0.7;
    }
  `}
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

const CurrencyLogoPair = styled.div`
  display: flex;

  > img {
    border: 2px solid ${({ theme }) => theme.grey1};
  }

  > img:last-child {
    margin: 0 0 0 -14px;
  }
`

const CurrencyCell = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 6px;
`

const CurrencyAmountWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 2px;
`

const ProgressBar = styled.div<{ value: number }>`
  position: relative;
  margin: 4px 0 0;
  height: 6px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    height: 100%;
    width: ${({ value }) => value}%;
    background: ${({ theme }) => theme.text3};
    border-radius: 6px;
  }
`

function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <AmountItem title={amount.toExact() + ' ' + amount.currency.symbol}>
      <TokenAmount amount={amount} tokenSymbol={amount.currency} />
    </AmountItem>
  )
}

function CurrencySymbolItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <CurrencyLogo currency={amount.currency} size="28px" />
  )
}

const balanceWarning = (symbol: string) => (
  <WarningParagraph>
    <h3>Insufficient balance for this limit order</h3>
    <p>
      Your wallet currently has insufficient{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      balance to execute this order.
      <br />
      The order is still open and will become executable when you top up your{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      balance.
    </p>
  </WarningParagraph>
)

const allowanceWarning = (symbol: string) => (
  <WarningParagraph>
    <h3>Insufficient approval for this limit order</h3>
    <p>
      This order is still open and valid, but you haven’t given CoW Swap sufficient allowance to spend{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>
      .
      <br />
      The order will become executable when you approve{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      in your account token page.
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

      {/* Order sell/buy tokens */}
      <CurrencyCell>
        <CurrencyLogoPair>
          <CurrencySymbolItem amount={getSellAmountWithFee(order)} />
          <CurrencySymbolItem amount={buyAmount} />
        </CurrencyLogoPair>
        <CurrencyAmountWrapper>
        <CurrencyAmountItem amount={getSellAmountWithFee(order)} />
        <CurrencyAmountItem amount={buyAmount} />
        </CurrencyAmountWrapper>
      </CurrencyCell>

      {/* Limit price */}
      <CellElement>
        <RateValue>
          <RateInfo prependSymbol={false} noLabel={true} isInversed={isRateInversed} rateInfoParams={rateInfoParams} />
        </RateValue>
      </CellElement>

      {/* Est. execution price */}
      {/* Market price */}
      <CellElement doubleRow>
        <b>1534.62 USDC</b>
        <i>1531.33 USDC</i>
      </CellElement>

      {/* Expires */}
      {/* Created */}
      <CellElement doubleRow>
        <b>6d 5h 23m</b>
        <i>15 mins ago</i>
      </CellElement>

      {/* Filled % */}
      <CellElement doubleRow>
        <b>13.12%</b>
        <ProgressBar value={13.12}></ProgressBar>
      </CellElement>

      <CellElement>
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
      </CellElement>
      <CellElement>
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
      </CellElement>
    </RowElement>
  )
}

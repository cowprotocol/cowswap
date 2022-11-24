import { OrderKind } from 'state/orders/actions'
import { GpModal } from 'components/Modal'
import * as styledEl from './styled'
import { StatusItem, RateValue } from '../Orders/OrdersTable.styled'
import { orderStatusTitleMap } from '../Orders/OrdersTable'
import { CloseIcon } from 'theme'
import { useMemo } from 'react'
import { CurrencyField } from './CurrencyField'
import { formatSmart } from 'utils/format'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { InfoIcon } from 'components/InfoIcon'
import { ExternalLink } from 'theme'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getEtherscanLink } from 'utils'
import moment from 'moment'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { FeeField } from './FeeField'
import { StyledScrollarea } from 'components/SearchModal/CommonBases/CommonBasesMod'

interface ReceiptProps {
  isOpen: boolean
  order: ParsedOrder
  chainId: SupportedChainId
  onDismiss: () => void
}

export function ReceiptModal({ isOpen, onDismiss, order, chainId }: ReceiptProps) {
  const executionPrice = useMemo(() => {
    if (
      !order ||
      !order.executedBuyAmount ||
      !order.executedSellAmount ||
      order.executedBuyAmount.isEqualTo(0) ||
      order.executedSellAmount.isEqualTo(0)
    ) {
      return null
    }

    return new Fraction(order.executedBuyAmount.toNumber(), order.executedSellAmount.toNumber())
  }, [order])

  const filledPercentage = useMemo(() => {
    if (!order || !order.filledPercentage) {
      return null
    }

    return order.filledPercentage.times('100').decimalPlaces(2).toString()
  }, [order])

  if (!order || !chainId) {
    return null
  }

  const inputLabel = order.kind === OrderKind.SELL ? 'You sell' : 'You sell at most'
  const outputLabel = order.kind === OrderKind.SELL ? 'Your receive at least' : 'You receive exactly'
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
  const limitPrice = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())

  const activityUrl = getEtherscanLink(chainId, order.id, 'transaction')

  const createdDate = moment(order.creationTime).format('MMM D YYYY, h:mm a')
  const expiryDate = moment(order.expirationDate).format('MMM D YYYY, h:mm a')

  return (
    <GpModal onDismiss={onDismiss} isOpen={isOpen}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <styledEl.Title>Order Receipt</styledEl.Title>
          <CloseIcon onClick={() => onDismiss()} />
        </styledEl.Header>

        <StyledScrollarea>
          <styledEl.Body>
            <CurrencyField amount={formatSmart(sellAmount)} token={order.inputToken} label={inputLabel} />
            <CurrencyField amount={formatSmart(buyAmount)} token={order.outputToken} label={outputLabel} />

            <styledEl.Field border="rounded-top">
              <styledEl.Label>
                <styledEl.LabelText>Status</styledEl.LabelText>
                <InfoIcon content={'Status info TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <StatusItem cancelling={!!order.isCancelling} status={order.status}>
                  {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
                </StatusItem>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Limit price</styledEl.LabelText>
                <InfoIcon content={'Limit price TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <RateValue>
                  1 {order.inputToken.symbol} ={' '}
                  <span title={limitPrice.toSignificant(18) + ' ' + order.outputToken.symbol}>
                    {formatSmart(limitPrice)} {order.outputToken.symbol}
                  </span>
                </RateValue>
              </styledEl.Value>
            </styledEl.Field>

            {!!executionPrice && (
              <styledEl.Field>
                <styledEl.Label>
                  <styledEl.LabelText>Execution price</styledEl.LabelText>
                  <InfoIcon content={'Execution price TODO'} />
                </styledEl.Label>

                <styledEl.Value>
                  <RateValue>
                    1 {order.inputToken.symbol} ={' '}
                    <span title={executionPrice?.toSignificant(18) + ' ' + order.outputToken.symbol}>
                      {executionPrice ? formatSmart(executionPrice) : 0} {order.outputToken.symbol}
                    </span>
                  </RateValue>
                </styledEl.Value>
              </styledEl.Field>
            )}

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Filled</styledEl.LabelText>
                <InfoIcon content={'Filled TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <styledEl.InlineWrapper>
                  <styledEl.Progress active={filledPercentage || 0} />
                  <span>{filledPercentage}%</span>
                </styledEl.InlineWrapper>

                <styledEl.InlineWrapper>
                  <strong>
                    {formatSmart(sellAmount)} {order.inputToken.symbol}
                  </strong>
                  <span style={{ margin: '0 5px' }}>sold for</span>
                  <strong>
                    {formatSmart(buyAmount)} {order.outputToken.symbol}
                  </strong>
                </styledEl.InlineWrapper>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Order surplus</styledEl.LabelText>
                <InfoIcon content={'Order surplus TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <strong>
                  {order.surplusFee} {order.outputToken.symbol}
                </strong>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Fee</styledEl.LabelText>
                <InfoIcon content={'Fee TODO'} />
              </styledEl.Label>

              <FeeField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Created</styledEl.LabelText>
                <InfoIcon content={'Created TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <styledEl.InlineWrapper>
                  <strong>{moment(order.creationTime).fromNow()}</strong>
                  <span>({createdDate})</span>
                </styledEl.InlineWrapper>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Expiry</styledEl.LabelText>
                <InfoIcon content={'Expiry TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <styledEl.InlineWrapper>
                  <strong>{moment(order.expirationDate).fromNow()}</strong>
                  <span>({expiryDate})</span>
                </styledEl.InlineWrapper>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field>
              <styledEl.Label>
                <styledEl.LabelText>Order type</styledEl.LabelText>
                <InfoIcon content={'Order type TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <strong>Fill or kil</strong>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field border="rounded-bottom">
              <styledEl.Label>
                <styledEl.LabelText>Order ID</styledEl.LabelText>
                <InfoIcon content={'Order ID TODO'} />
              </styledEl.Label>

              <styledEl.Value>
                <ExternalLink href={activityUrl || ''}>
                  <span>{order.id.slice(0, 8)}</span>
                  <span>↗</span>
                </ExternalLink>
              </styledEl.Value>
            </styledEl.Field>
          </styledEl.Body>
        </StyledScrollarea>
      </styledEl.Wrapper>
    </GpModal>
  )
}

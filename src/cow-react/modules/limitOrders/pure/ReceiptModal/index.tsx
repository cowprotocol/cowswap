import { OrderKind } from 'state/orders/actions'
import { GpModal } from 'components/Modal'
import * as styledEl from './styled'
import { StatusItem } from '../Orders/OrdersTable.styled'
import { orderStatusTitleMap } from '../Orders/OrdersTable'
import { CloseIcon } from 'theme'
import { useMemo } from 'react'
import { CurrencyField } from './CurrencyField'
import { formatSmart } from 'utils/format'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { ExternalLink } from 'theme'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getEtherscanLink } from 'utils'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { FeeField } from './FeeField'
import { StyledScrollarea } from 'components/SearchModal/CommonBases/CommonBasesMod'
import { FieldLabel } from './FieldLabel'
import { PriceField } from './PriceField'
import { DateField } from './DateField'
import { FilledField } from './FilledField'
import { SurplusField } from './SurplusField'

interface ReceiptProps {
  isOpen: boolean
  order: ParsedOrder
  chainId: SupportedChainId
  onDismiss: () => void
}

enum Tooltip {
  STATUS = 'Status info TODO',
  LIMIT_PRICE = 'Limit price TODO',
  EXECUTION_PRICE = 'Execution price TODO',
  FILLED = 'Filled TODO',
  SURPLUS = 'Order Surplus TODO',
  FEE = 'Fee TODO',
  CREATED = 'Created date TODO',
  EXPIRY = 'Expiry date TODO',
  ORDER_TYPE = 'Order type TODO',
  ORDER_ID = 'Order id TODO',
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

  if (!order || !chainId) {
    return null
  }

  const inputLabel = order.kind === OrderKind.SELL ? 'You sell' : 'You sell at most'
  const outputLabel = order.kind === OrderKind.SELL ? 'Your receive at least' : 'You receive exactly'
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
  const limitPrice = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())
  const activityUrl = getEtherscanLink(chainId, order.id, 'transaction')

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
              <FieldLabel label="Status" tooltip={Tooltip.STATUS} />

              <styledEl.Value>
                <StatusItem cancelling={!!order.isCancelling} status={order.status}>
                  {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
                </StatusItem>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Limit price" tooltip={Tooltip.LIMIT_PRICE} />
              <PriceField order={order} price={limitPrice} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Execution price" tooltip={Tooltip.EXECUTION_PRICE} />
              <PriceField order={order} price={executionPrice} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Filled" tooltip={Tooltip.FILLED} />
              <FilledField order={order} sellAmount={sellAmount} buyAmount={buyAmount} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Order surplus" tooltip={Tooltip.SURPLUS} />
              <SurplusField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Fee" tooltip={Tooltip.FEE} />
              <FeeField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Ceated" tooltip={Tooltip.CREATED} />
              <DateField date={order.creationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Expiry" tooltip={Tooltip.EXPIRY} />
              <DateField date={order.creationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Order type" tooltip={Tooltip.ORDER_TYPE} />

              <styledEl.Value>
                <strong>Fill or kil</strong>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field border="rounded-bottom">
              <FieldLabel label="Order ID" tooltip={Tooltip.ORDER_ID} />

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

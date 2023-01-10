import { GpModal } from 'components/Modal'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { OrderKind, OrderStatus } from 'state/orders/actions'
import { CloseIcon } from 'theme'
import { CurrencyField } from './CurrencyField'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'
import { FeeField } from './FeeField'
import { FieldLabel } from './FieldLabel'
import { PriceField } from './PriceField'
import { DateField } from './DateField'
import { FilledField } from './FilledField'
import { SurplusField } from './SurplusField'
import { IdField } from './IdField'
import { StatusField } from './StatusField'
import { OrderTypeField } from './OrderTypeField'

interface ReceiptProps {
  isOpen: boolean
  order: ParsedOrder
  chainId: SupportedChainId
  onDismiss: () => void
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
  limitPrice: Fraction | null
  executionPrice: Fraction | null
}

const tooltips: { [key: string]: string | JSX.Element } = {
  LIMIT_PRICE: 'You will receive this price or better for your tokens.',
  EXECUTION_PRICE: 'An order’s actual execution price will vary based on the market price and network fees.',
  FILLED:
    'CoW Swap doesn’t currently support partial fills. Your order will either be filled completely or not at all.',
  SURPLUS: 'The amount of extra tokens you get on top of your limit price.',
  FEE: 'CoW Protocol covers the fees by executing your order at a slightly better price than your limit price.',
  CREATED: 'Your order was created on this date & time. It will remain open until it expires or is filled.',
  EXPIRY:
    "If your order has not been filled by this date & time, it will expire. Don't worry - expirations and order placement are free on CoW Swap!",
  ORDER_TYPE: (
    <span>
      Orders on CoW Swap can either be market orders (which fill at the market price within the slippage tolerance you
      set) or limit orders (which fill at a price you specify).
      <br />
      <br />
      All orders are currently fill or kill, but support for partially fillable limit orders is coming soon!
    </span>
  ),
}

// TODO: add cosmos fixture for this component
export function ReceiptModal({
  isOpen,
  onDismiss,
  order,
  chainId,
  sellAmount,
  buyAmount,
  limitPrice,
  executionPrice,
}: ReceiptProps) {
  if (!order || !chainId) {
    return null
  }

  const inputLabel = order.kind === OrderKind.SELL ? 'You sell' : 'You sell at most'
  const outputLabel = order.kind === OrderKind.SELL ? 'You receive at least' : 'You receive exactly'

  const showCreationTxLink =
    (order.status === OrderStatus.CREATING || order.status === OrderStatus.FAILED) &&
    order.orderCreationHash &&
    !order.apiAdditionalInfo

  return (
    <GpModal onDismiss={onDismiss} isOpen={isOpen}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <styledEl.Title>Order Receipt</styledEl.Title>
          <CloseIcon onClick={() => onDismiss()} />
        </styledEl.Header>

        <styledEl.Body>
          <CurrencyField amount={getSellAmountWithFee(order)} token={order.inputToken} label={inputLabel} />
          <CurrencyField amount={buyAmount} token={order.outputToken} label={outputLabel} />

          <styledEl.FieldsWrapper>
            <styledEl.Field>
              <FieldLabel label="Status" />
              <StatusField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Limit price" tooltip={tooltips.LIMIT_PRICE} />
              <PriceField order={order} price={limitPrice} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Execution price" tooltip={tooltips.EXECUTION_PRICE} />
              <PriceField order={order} price={executionPrice} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Filled" tooltip={tooltips.FILLED} />
              <FilledField order={order} sellAmount={sellAmount} buyAmount={buyAmount} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Order surplus" tooltip={tooltips.SURPLUS} />
              <SurplusField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Fee" tooltip={tooltips.FEE} />
              <FeeField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Created" tooltip={tooltips.CREATED} />
              <DateField date={order.parsedCreationtime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Expiry" tooltip={tooltips.EXPIRY} />
              <DateField date={order.expirationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Order type" tooltip={tooltips.ORDER_TYPE} />
              <OrderTypeField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              {showCreationTxLink ? (
                <>
                  <FieldLabel label="Creation transaction" />
                  <IdField id={order.orderCreationHash as string} chainId={chainId} />
                </>
              ) : (
                <>
                  <FieldLabel label="Order ID" />
                  <IdField id={order.id} chainId={chainId} />
                </>
              )}
            </styledEl.Field>
          </styledEl.FieldsWrapper>
        </styledEl.Body>
      </styledEl.Wrapper>
    </GpModal>
  )
}

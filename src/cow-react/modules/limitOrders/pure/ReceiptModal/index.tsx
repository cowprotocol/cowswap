import { GpModal } from 'components/Modal'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { OrderKind } from 'state/orders/actions'
import { CloseIcon } from 'theme'
import { CurrencyField } from './CurrencyField'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { FeeField } from './FeeField'
import { StyledScrollarea } from 'components/SearchModal/CommonBases/CommonBasesMod'
import { FieldLabel } from './FieldLabel'
import { PriceField } from './PriceField'
import { DateField } from './DateField'
import { FilledField } from './FilledField'
import { SurplusField } from './SurplusField'
import { OrderIDField } from './OrderIdField'
import { StatusField } from './StatusField'

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
  const outputLabel = order.kind === OrderKind.SELL ? 'Your receive at least' : 'You receive exactly'

  return (
    <GpModal onDismiss={onDismiss} isOpen={isOpen}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <styledEl.Title>Order Receipt</styledEl.Title>
          <CloseIcon onClick={() => onDismiss()} />
        </styledEl.Header>

        <StyledScrollarea>
          <styledEl.Body>
            <CurrencyField amount={sellAmount} token={order.inputToken} label={inputLabel} />
            <CurrencyField amount={buyAmount} token={order.outputToken} label={outputLabel} />

            <styledEl.Field border="rounded-top">
              <FieldLabel label="Status" tooltip={Tooltip.STATUS} />
              <StatusField order={order} />
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
              <FieldLabel label="Created" tooltip={Tooltip.CREATED} />
              <DateField date={order.creationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Expiry" tooltip={Tooltip.EXPIRY} />
              <DateField date={order.expirationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Order type" tooltip={Tooltip.ORDER_TYPE} />

              <styledEl.Value>
                <strong>Fill or kil</strong>
              </styledEl.Value>
            </styledEl.Field>

            <styledEl.Field border="rounded-bottom">
              <FieldLabel label="Order ID" tooltip={Tooltip.ORDER_ID} />
              <OrderIDField order={order} chainId={chainId} />
            </styledEl.Field>
          </styledEl.Body>
        </StyledScrollarea>
      </styledEl.Wrapper>
    </GpModal>
  )
}

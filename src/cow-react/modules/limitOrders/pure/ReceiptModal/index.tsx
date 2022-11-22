import { Order, OrderKind } from 'state/orders/actions'
import { GpModal } from 'components/Modal'
import * as styledEl from './styled'
import { CloseIcon } from 'theme'
import { CurrencyField } from './CurrencyField'
import { formatSmart } from 'utils/format'
import { CurrencyAmount } from '@uniswap/sdk-core'

interface ReceiptProps {
  isOpen: boolean
  order: Order | null
  onDismiss: () => void
}

export function ReceiptModal({ isOpen, onDismiss, order }: ReceiptProps) {
  if (!order) {
    return null
  }

  const inputLabel = order.kind === OrderKind.SELL ? 'You sell' : 'You sell at most'
  const outputLabel = order.kind === OrderKind.SELL ? 'Your receive at least' : 'You receive exactly'
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())

  return (
    <GpModal onDismiss={onDismiss} isOpen={isOpen}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <styledEl.Title>Order Receipt</styledEl.Title>
          <CloseIcon onClick={() => onDismiss()} />
        </styledEl.Header>

        <styledEl.Body>
          <CurrencyField amount={formatSmart(sellAmount)} token={order.inputToken} label={inputLabel} />
          <CurrencyField amount={formatSmart(buyAmount)} token={order.outputToken} label={outputLabel} />
        </styledEl.Body>
      </styledEl.Wrapper>
    </GpModal>
  )
}

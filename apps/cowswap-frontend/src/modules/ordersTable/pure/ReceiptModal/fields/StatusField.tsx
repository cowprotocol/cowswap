import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { OrderStatusBox } from '../../OrderStatusBox/OrderStatusBox.pure'
import * as styledEl from '../ReceiptModal.styled'

export type Props = {
  order: ParsedOrder
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function StatusField({ order }: Props) {
  return (
    <styledEl.Value>
      <OrderStatusBox order={order} widthAuto />
    </styledEl.Value>
  )
}

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

import { OrderStatusBox } from '../OrderStatusBox'

export type Props = {
  order: ParsedOrder
}

export function StatusField({ order }: Props) {
  return (
    <styledEl.Value>
      <OrderStatusBox order={order} widthAuto />
    </styledEl.Value>
  )
}

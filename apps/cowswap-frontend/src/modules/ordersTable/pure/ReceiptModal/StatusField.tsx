import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

import { OrderStatusBox } from '../OrderStatusBox'

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

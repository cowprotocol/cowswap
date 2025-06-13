import { UiOrderType } from '@cowprotocol/types'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = {
  order: ParsedOrder
}

const ORDER_UI_TYPE_LABELS: Record<UiOrderType, string> = {
  [UiOrderType.SWAP]: 'Market',
  [UiOrderType.LIMIT]: 'Limit',
  [UiOrderType.TWAP]: 'TWAP',
  [UiOrderType.HOOKS]: 'Hooks',
  [UiOrderType.YIELD]: 'Yield',
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderTypeField({ order }: Props) {
  const uiOrderType = getUiOrderType(order)

  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {ORDER_UI_TYPE_LABELS[uiOrderType]} {order.kind} order{' '}
        {order.partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}

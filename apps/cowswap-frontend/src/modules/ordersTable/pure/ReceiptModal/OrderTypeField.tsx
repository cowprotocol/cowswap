import { UiOrderType } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = {
  order: ParsedOrder
}

const orderUITypeLabels = (): Record<UiOrderType, string> => ({
  [UiOrderType.SWAP]: t`Market`,
  [UiOrderType.LIMIT]: t`Limit`,
  [UiOrderType.TWAP]: t`TWAP`,
  [UiOrderType.HOOKS]: t`Hooks`,
  [UiOrderType.YIELD]: t`Yield`,
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderTypeField({ order }: Props) {
  const uiOrderType = getUiOrderType(order)
  const typeLabels = orderUITypeLabels()

  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {typeLabels[uiOrderType]} {order.kind} <Trans>order</Trans>{' '}
        {order.partiallyFillable ? t`(Partially fillable)` : t`(Fill or Kill)`}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}

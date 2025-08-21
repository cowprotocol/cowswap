import { UiOrderType } from '@cowprotocol/types'

import { i18n, MessageDescriptor } from '@lingui/core'
import { msg, t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = {
  order: ParsedOrder
}

const orderUITypeLabels: Record<UiOrderType, MessageDescriptor> = {
  [UiOrderType.SWAP]: msg`Market`,
  [UiOrderType.LIMIT]: msg`Limit`,
  [UiOrderType.TWAP]: msg`TWAP`,
  [UiOrderType.HOOKS]: msg`Hooks`,
  [UiOrderType.YIELD]: msg`Yield`,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderTypeField({ order }: Props) {
  const uiOrderType = getUiOrderType(order)

  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {i18n._(orderUITypeLabels[uiOrderType])} {order.kind} <Trans>order</Trans>{' '}
        {order.partiallyFillable ? t`(Partially fillable)` : t`(Fill or Kill)`}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}

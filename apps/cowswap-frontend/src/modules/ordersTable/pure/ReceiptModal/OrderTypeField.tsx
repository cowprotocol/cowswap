import { UiOrderType } from '@cowprotocol/types'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'

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
  const { i18n, t } = useLingui()
  const orderKind = order.kind === 'buy' ? t`buy` : order.kind === 'sell' ? t`sell` : order.kind
  const orderType = i18n._(orderUITypeLabels[uiOrderType])

  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {/* TODO: this may need a rework for better localization */}
        <Trans>
          {orderType} {orderKind} order
        </Trans>{' '}
        {order.partiallyFillable ? t`(Partially fillable)` : t`(Fill or Kill)`}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}

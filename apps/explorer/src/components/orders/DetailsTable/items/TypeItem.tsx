import { ReactNode } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { capitalize } from 'utils'

import { UiOrderType } from 'utils/getUiOrderType'

import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface TypeItemProps {
  kind: OrderKind
  uiOrderType: UiOrderType
  partiallyFillable: boolean
}

export function TypeItem({ kind, uiOrderType, partiallyFillable }: TypeItemProps): ReactNode {
  return (
    <DetailRow label="Type" tooltipText={DetailsTableTooltips.type}>
      {capitalize(kind)} {uiOrderType.toLowerCase()} order{' '}
      {partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
    </DetailRow>
  )
}

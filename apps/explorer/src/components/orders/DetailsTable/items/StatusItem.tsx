import { ReactNode } from 'react'

import { BridgeStatus } from '@cowprotocol/sdk-bridging'

import { StatusLabel } from 'components/orders/StatusLabel'

import { OrderStatus } from 'api/operator'

import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface StatusItemProps {
  status: OrderStatus | BridgeStatus
  partiallyFilled?: boolean
}

export function StatusItem({ status, partiallyFilled }: StatusItemProps): ReactNode {
  return (
    <DetailRow label="Status" tooltipText={DetailsTableTooltips.status}>
      <StatusLabel status={status} partiallyFilled={partiallyFilled} partialTagPosition="right" />
    </DetailRow>
  )
}

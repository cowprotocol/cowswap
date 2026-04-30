import { ReactNode } from 'react'

import { DateDisplay } from '../../../common/DateDisplay'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface ExpirationTimeItemProps {
  expirationDate: Date
  showIcon: boolean
}

export function ExpirationTimeItem({ expirationDate, showIcon }: ExpirationTimeItemProps): ReactNode {
  return (
    <DetailRow label="Expiration Time" tooltipText={DetailsTableTooltips.expiration}>
      <DateDisplay date={expirationDate} showIcon={showIcon} />
    </DetailRow>
  )
}

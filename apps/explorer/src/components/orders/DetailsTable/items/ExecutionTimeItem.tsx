import { ReactNode } from 'react'

import { DateDisplay } from '../../../common/DateDisplay'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface ExecutionTimeItemProps {
  executionDate: Date
  showIcon: boolean
}

export function ExecutionTimeItem({ executionDate, showIcon }: ExecutionTimeItemProps): ReactNode {
  return (
    <DetailRow label="Execution Time" tooltipText={DetailsTableTooltips.execution}>
      <DateDisplay date={executionDate} showIcon={showIcon} />
    </DetailRow>
  )
}

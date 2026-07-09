import { ReactNode } from 'react'

import { DateDisplay } from '../../../common/DateDisplay'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface SubmissionTimeItemProps {
  creationDate: Date
  showIcon: boolean
}

export function SubmissionTimeItem({ creationDate, showIcon }: SubmissionTimeItemProps): ReactNode {
  return (
    <DetailRow label="Submission Time" tooltipText={DetailsTableTooltips.submission}>
      <DateDisplay date={creationDate} showIcon={showIcon} />
    </DetailRow>
  )
}

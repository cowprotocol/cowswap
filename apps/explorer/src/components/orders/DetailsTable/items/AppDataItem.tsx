import { ReactNode } from 'react'

import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'

export function AppDataItem({ appData }: { appData: string }): ReactNode {
  return (
    <DetailRow label="AppData" tooltipText={DetailsTableTooltips.appData}>
      <RowWithCopyButton textToCopy={appData} contentsToDisplay={appData} />
    </DetailRow>
  )
}

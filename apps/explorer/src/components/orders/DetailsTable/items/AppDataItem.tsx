import { ReactNode } from 'react'

import { DecodeAppData } from '../../../AppData/DecodeAppData'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface AppDataItemProps {
  appData: string
  fullAppData?: string | null
}

export function AppDataItem({ appData, fullAppData }: AppDataItemProps): ReactNode {
  return (
    <DetailRow label="AppData" tooltipText={DetailsTableTooltips.appData}>
      <DecodeAppData appData={appData} fullAppData={fullAppData ?? undefined} />
    </DetailRow>
  )
}

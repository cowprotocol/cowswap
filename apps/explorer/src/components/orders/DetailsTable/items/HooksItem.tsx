import { PropsWithChildren, ReactNode } from 'react'

import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

type HooksItemProps = PropsWithChildren

export function HooksItem({ children }: HooksItemProps): ReactNode {
  return (
    <DetailRow label="Hooks" tooltipText={DetailsTableTooltips.hooks} stack>
      {children}
    </DetailRow>
  )
}

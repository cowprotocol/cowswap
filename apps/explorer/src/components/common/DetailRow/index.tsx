import { ReactNode } from 'react'

import { HelpTooltip } from 'components/Tooltip'
import ShimmerBar from 'explorer/components/common/ShimmerBar'

export interface DetailRowProps {
  label: string
  tooltipText?: ReactNode
  children: ReactNode
  isLoading?: boolean
}

export function DetailRow({ label, tooltipText, children, isLoading }: DetailRowProps): ReactNode {
  return (
    <tr>
      <td>
        <span>
          {tooltipText && <HelpTooltip tooltip={tooltipText} />} {label}
        </span>
      </td>
      <td>{isLoading ? <ShimmerBar height={1.6} /> : (children ?? '-')}</td>
    </tr>
  )
}

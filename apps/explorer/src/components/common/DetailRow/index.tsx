import React from 'react'

import ShimmerBar from '../../../explorer/components/common/ShimmerBar'
import { HelpTooltip } from '../../Tooltip'

export interface DetailRowProps {
  label: string
  tooltipText?: React.ReactNode
  children: React.ReactNode
  isLoading?: boolean
}

export function DetailRow({ label, tooltipText, children, isLoading }: DetailRowProps): React.ReactNode {
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

import { ReactNode } from 'react'

import { customDeadlineToSeconds } from '../../utils/deadlinePartsDisplay'
import { TotalDurationTooltip } from '../TotalDurationTooltip/TotalDurationTooltip.pure'

export interface CustomDeadlineDescriptionProps {
  hours: number
  minutes: number
  parts: number
  partDuration: number
}

export function CustomDeadlineDescription({
  hours,
  minutes,
  parts,
  partDuration,
}: CustomDeadlineDescriptionProps): ReactNode {
  const hasCustomInput = hours > 0 || minutes > 0
  const totalDuration = hasCustomInput ? customDeadlineToSeconds({ hours, minutes }) : parts * partDuration
  const resolvedPartDuration = hasCustomInput && parts > 0 ? Math.ceil(totalDuration / parts) : partDuration

  return <TotalDurationTooltip parts={parts} partDuration={resolvedPartDuration} totalDuration={totalDuration} padded />
}

import { ReactNode } from 'react'

import { Plural, Trans } from '@lingui/react/macro'

import * as styledEl from './TotalDurationTooltip.styled'

import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { PaddedDeadlineDisplay } from '../PaddedDeadlineDisplay/PaddedDeadlineDisplay.pure'

export interface TotalDurationTooltipProps {
  parts: number
  partDuration: number
  totalDuration?: number
  padded?: boolean
}

export function TotalDurationTooltip({
  parts,
  partDuration,
  totalDuration,
  padded = false,
}: TotalDurationTooltipProps): ReactNode {
  const resolvedTotalDuration = totalDuration ?? parts * partDuration
  const totalDurationDisplay = padded ? (
    <PaddedDeadlineDisplay seconds={resolvedTotalDuration} />
  ) : (
    <b>{deadlinePartsDisplay(resolvedTotalDuration)}</b>
  )
  const partDurationDisplay = padded ? (
    <PaddedDeadlineDisplay seconds={partDuration} />
  ) : (
    <b>{deadlinePartsDisplay(partDuration)}</b>
  )

  return (
    <>
      <p>
        <Trans>The "Total duration" is the duration it takes to execute all parts of your TWAP order.</Trans>
      </p>
      <p>
        <Trans>For instance:</Trans>
      </p>
      <styledEl.ExampleList>
        <li>
          <Trans>
            Your order consists of{' '}
            <b>
              <Plural value={parts} one="# part" few="# parts" many="# parts" other="# parts" />
            </b>
            .
          </Trans>
        </li>
        <li>
          <Trans>Total time to complete the order is {totalDurationDisplay}.</Trans>
        </li>
        <li>
          <Trans>
            So a new part is placed every {partDurationDisplay}, and remains open until the next one becomes active.
          </Trans>
        </li>
      </styledEl.ExampleList>
    </>
  )
}

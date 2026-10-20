import { ReactNode, useMemo, useState } from 'react'

import { Currency } from '@cowprotocol/currency'

import { Trans } from '@lingui/react/macro'
import { PiCaretDown } from 'react-icons/pi'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { ExpandableContent } from 'common/pure/ExpandableContent/ExpandableContent.pure'
import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './SolverCompetitionExpand.styled'

import { SolverAuctionResult } from '../SolverAuctionResult/SolverAuctionResult.pure'

const MAX_STACKED_AVATARS = 3

export interface SolverCompetitionExpandProps {
  solvers: SolverCompetition[]
  totalSolvers?: number
  buyToken?: Currency
  className?: string
  defaultExpanded?: boolean
}

export function SolverCompetitionExpand({
  solvers,
  totalSolvers,
  buyToken,
  className,
  defaultExpanded = false,
}: SolverCompetitionExpandProps): ReactNode {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const solversLength = solvers.length
  const winner = solvers[0]
  const winnerName = winner?.displayName || winner?.solver || ''
  const competedCount = totalSolvers && totalSolvers > solversLength ? totalSolvers : solversLength
  const stackedSolvers = useMemo(() => solvers.slice(0, MAX_STACKED_AVATARS), [solvers])

  if (solversLength === 0) {
    return null
  }

  return (
    <styledEl.Wrapper className={className} data-testid="solver-competition-expand">
      <styledEl.ToggleRow
        type="button"
        aria-expanded={expanded}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.PROGRESS_BAR,
          action: 'Click Toggle Solver Expand',
          label: expanded ? 'Collapse' : 'Expand',
        })}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <styledEl.SolverStack aria-hidden data-testid="solver-competition-stack">
          {stackedSolvers.map((solver, index) => (
            <styledEl.SolverAvatar
              key={`${solver.solver}-${index}`}
              $stackIndex={index}
              src={solver.image || AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src}
              alt=""
            />
          ))}
        </styledEl.SolverStack>

        <styledEl.CompetedLabel>
          <Trans>{competedCount} solvers competed</Trans>
        </styledEl.CompetedLabel>

        {winnerName ? (
          <styledEl.WinnerLabel>
            <Trans>{winnerName} won</Trans>
          </styledEl.WinnerLabel>
        ) : null}

        <styledEl.Chevron $expanded={expanded} aria-hidden>
          <PiCaretDown size={12} />
        </styledEl.Chevron>
      </styledEl.ToggleRow>

      <ExpandableContent expanded={expanded} variant="bordered">
        <SolverAuctionResult solvers={solvers} totalSolvers={totalSolvers} buyToken={buyToken} />
      </ExpandableContent>
    </styledEl.Wrapper>
  )
}

import { ReactNode, useMemo, useState } from 'react'

import { InfoTooltip } from '@cowprotocol/ui'

import { plural } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { PiCaretDown, PiCaretUp, PiTrophyFill } from 'react-icons/pi'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { ExpandableContent } from 'common/pure/ExpandableContent/ExpandableContent.pure'
import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './SolverCompetitionExpand.styled'

import * as stepStyled from '../steps/styled'

const MAX_STACKED_AVATARS = 3

export interface SolverCompetitionExpandProps {
  solvers: SolverCompetition[]
  totalSolvers?: number
  className?: string
  defaultExpanded?: boolean
}

export function SolverCompetitionExpand({
  solvers,
  totalSolvers,
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
        <styledEl.SolverStack aria-hidden>
          {stackedSolvers.map((solver, index) => (
            <styledEl.SolverAvatar
              key={`${solver.solver}-${index}`}
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

      <ExpandableContent expanded={expanded}>
        <styledEl.ExpandedPanel>
          <SolverRankingsPanel solvers={solvers} totalSolvers={totalSolvers} />
        </styledEl.ExpandedPanel>
      </ExpandableContent>
    </styledEl.Wrapper>
  )
}

function SolverRankingsPanel({
  solvers,
  totalSolvers,
}: {
  solvers: SolverCompetition[]
  totalSolvers?: number
}): ReactNode {
  const { t } = useLingui()
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const solversLength = solvers.length
  const visibleSolvers = useMemo(() => (showAllSolvers ? solvers : solvers.slice(0, 3)), [showAllSolvers, solvers])

  return (
    <stepStyled.SolverRankings>
      <h3>
        <Trans>Solver auction rankings</Trans>
      </h3>
      {solversLength > 1 && (
        <p>
          <b>
            {totalSolvers ? (
              <Trans>
                {solversLength} out of {totalSolvers} solvers
              </Trans>
            ) : (
              <Trans>{solversLength} solvers</Trans>
            )}
          </b>{' '}
          <Trans>submitted a solution</Trans>
        </p>
      )}

      <stepStyled.SolverTable>
        <tbody>
          {visibleSolvers.map((solver, index) => (
            <SolverRow key={`${solver.solver}-${index}`} solver={solver} index={index} solvers={solvers} />
          ))}
        </tbody>
      </stepStyled.SolverTable>

      {solversLength > 3 && (
        <stepStyled.ViewMoreButton
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.PROGRESS_BAR,
            action: 'Click Toggle Solvers',
            label: showAllSolvers ? 'Hide' : 'Show',
          })}
          onClick={() => setShowAllSolvers((prev) => !prev)}
        >
          {showAllSolvers ? (
            <>
              <Trans>Collapse</Trans> <PiCaretUp />
            </>
          ) : (
            <>
              {t`View ${plural(solversLength - 3, {
                one: '# more',
                few: '# more',
                many: '# more',
                other: '# more',
              })}`}{' '}
              <PiCaretDown />
            </>
          )}
        </stepStyled.ViewMoreButton>
      )}
    </stepStyled.SolverRankings>
  )
}

function SolverRow({
  solver,
  index,
  solvers,
}: {
  solver: SolverCompetition
  index: number
  solvers: SolverCompetition[]
}): ReactNode {
  return (
    <stepStyled.SolverTableRow isWinner={index === 0}>
      {solvers.length > 1 && <stepStyled.SolverRank>{index + 1}</stepStyled.SolverRank>}
      <stepStyled.SolverTableCell>
        <stepStyled.SolverInfo>
          <stepStyled.SolverLogo>
            <img
              src={solver.image || AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src}
              alt={`${solver.solver} logo`}
              width="24"
              height="24"
            />
          </stepStyled.SolverLogo>
          <stepStyled.SolverName>
            {solver.displayName || solver.solver}
            {solver.description && (
              <span>
                <InfoTooltip content={solver.description} />
              </span>
            )}
          </stepStyled.SolverName>
        </stepStyled.SolverInfo>
      </stepStyled.SolverTableCell>
      <stepStyled.SolverTableCell>
        {index === 0 && (
          <stepStyled.WinningBadge>
            <stepStyled.TrophyIcon>
              <PiTrophyFill />
            </stepStyled.TrophyIcon>
            <span>
              <Trans>Winning solver</Trans>
            </span>
          </stepStyled.WinningBadge>
        )}
      </stepStyled.SolverTableCell>
    </stepStyled.SolverTableRow>
  )
}

import { ReactNode, useMemo, useState } from 'react'

import { Currency } from '@cowprotocol/currency'

import { Plural, Trans } from '@lingui/react/macro'
import { PiCaretDown, PiCaretUp } from 'react-icons/pi'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { SolverCompetition } from 'common/types/soverCompetition'

import { AuctionDotMap } from './AuctionDotMap/AuctionDotMap.pure'
import { AuctionLegend } from './AuctionLegend/AuctionLegend.pure'
import * as styledEl from './SolverAuctionResult.styled'
import { buildAuctionDots, getAuctionLegendCounts, getSolverBuyAmount } from './SolverAuctionResult.utils'
import { SolverAuctionRow } from './SolverAuctionRow/SolverAuctionRow.pure'

const INITIAL_VISIBLE_SOLVERS = 3
const AUCTION_DOCS_HREF = 'https://docs.cow.fi/cow-protocol/concepts/introduction/fair-combinatorial-auction'

export interface SolverAuctionResultProps {
  solvers: SolverCompetition[]
  totalSolvers?: number
  buyToken?: Currency
  className?: string
  dotsAnimationKey?: number
  framed?: boolean
}

export function SolverAuctionResult({
  solvers,
  totalSolvers,
  buyToken,
  className,
  dotsAnimationKey = 0,
  framed = false,
}: SolverAuctionResultProps): ReactNode {
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const solversLength = solvers.length
  const winner = solvers[0]
  const winnerName = winner?.displayName || winner?.solver || ''
  const visibleSolvers = useMemo(
    () => (showAllSolvers ? solvers : solvers.slice(0, INITIAL_VISIBLE_SOLVERS)),
    [showAllSolvers, solvers],
  )
  const legend = useMemo(() => getAuctionLegendCounts(solversLength, totalSolvers), [solversLength, totalSolvers])
  const dots = useMemo(() => buildAuctionDots(legend.total, solversLength), [legend.total, solversLength])
  const winnerBuyAmount = useMemo(
    () => (buyToken && winner ? getSolverBuyAmount(winner, buyToken) : null),
    [buyToken, winner],
  )

  if (solversLength === 0) {
    return null
  }

  return (
    <styledEl.Wrapper className={className} $framed={framed} data-testid="solver-auction-result">
      <styledEl.Header>
        <styledEl.Eyebrow>
          <Trans>Solver auction</Trans>
        </styledEl.Eyebrow>
        <styledEl.Title>
          {solversLength === 1 && winnerName ? (
            <Trans>{winnerName} solved your order</Trans>
          ) : (
            <Plural
              value={solversLength}
              one="# solver competed for your order"
              few="# solvers competed for your order"
              many="# solvers competed for your order"
              other="# solvers competed for your order"
            />
          )}
        </styledEl.Title>
        {solversLength === 1 ? (
          <styledEl.Subtitle>
            <Trans>It was the only bid this time.</Trans>
          </styledEl.Subtitle>
        ) : null}
      </styledEl.Header>

      <AuctionDotMap dots={dots} animationKey={dotsAnimationKey} />
      <AuctionLegend won={legend.won} alsoBid={legend.alsoBid} didntBid={legend.didntBid} total={legend.total} />

      <styledEl.List>
        {visibleSolvers.map((solver, index) => (
          <SolverAuctionRow
            key={`${solver.solver}-${index}`}
            solver={solver}
            index={index}
            buyToken={buyToken}
            winnerBuyAmount={winnerBuyAmount}
          />
        ))}
      </styledEl.List>

      <styledEl.Footer>
        {solversLength > INITIAL_VISIBLE_SOLVERS ? (
          <styledEl.ViewMoreButton
            type="button"
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.PROGRESS_BAR,
              action: 'Click Toggle Solvers',
              label: showAllSolvers ? 'Hide' : 'Show',
            })}
            onClick={() => setShowAllSolvers((prev) => !prev)}
          >
            {showAllSolvers ? (
              <>
                <Trans>Show less</Trans> <PiCaretUp />
              </>
            ) : (
              <>
                <Trans>View all bids</Trans> <PiCaretDown />
              </>
            )}
          </styledEl.ViewMoreButton>
        ) : null}
        <styledEl.AuctionDocsLink
          href={AUCTION_DOCS_HREF}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.PROGRESS_BAR,
            action: 'Click Learn More',
            label: 'How the auction works',
          })}
        >
          <Trans>How the auction works</Trans> ↗
        </styledEl.AuctionDocsLink>
      </styledEl.Footer>
    </styledEl.Wrapper>
  )
}

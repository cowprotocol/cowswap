import { ReactNode, useMemo, useState } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { FiatAmount, InfoTooltip, TokenAmount } from '@cowprotocol/ui'

import { plural } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { PiCaretDown, PiCaretUp, PiTrophyFill } from 'react-icons/pi'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { useUsdAmount } from 'modules/usdAmount'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './SolverAuctionResult.styled'
import { AuctionDotKind, buildAuctionDots, getAuctionLegendCounts } from './SolverAuctionResult.utils'

const INITIAL_VISIBLE_SOLVERS = 3

export interface SolverAuctionResultProps {
  solvers: SolverCompetition[]
  totalSolvers?: number
  buyToken?: Currency
  className?: string
}

export function SolverAuctionResult({
  solvers,
  totalSolvers,
  buyToken,
  className,
}: SolverAuctionResultProps): ReactNode {
  const { t } = useLingui()
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const solversLength = solvers.length
  const visibleSolvers = useMemo(
    () => (showAllSolvers ? solvers : solvers.slice(0, INITIAL_VISIBLE_SOLVERS)),
    [showAllSolvers, solvers],
  )
  const legend = useMemo(() => getAuctionLegendCounts(solversLength, totalSolvers), [solversLength, totalSolvers])
  const dots = useMemo(() => buildAuctionDots(legend.total, solversLength), [legend.total, solversLength])
  const winnerBuyAmount = useMemo(
    () => (buyToken && solvers[0] ? getSolverBuyAmount(solvers[0], buyToken) : null),
    [buyToken, solvers],
  )

  if (solversLength === 0) {
    return null
  }

  return (
    <styledEl.Wrapper className={className} data-testid="solver-auction-result">
      <styledEl.Header>
        <styledEl.Eyebrow>
          <Trans>Solver auction</Trans>
        </styledEl.Eyebrow>
        <styledEl.Title>
          <Trans>{solversLength} solvers competed for your order</Trans>
        </styledEl.Title>
      </styledEl.Header>

      <AuctionDotMap dots={dots} />
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
              <Trans>Collapse</Trans> <PiCaretUp />
            </>
          ) : (
            <>
              {t`View all ${plural(solversLength, {
                one: '# bid',
                few: '# bids',
                many: '# bids',
                other: '# bids',
              })}`}{' '}
              <PiCaretDown />
            </>
          )}
        </styledEl.ViewMoreButton>
      ) : null}
    </styledEl.Wrapper>
  )
}

function AuctionDotMap({ dots }: { dots: AuctionDotKind[] }): ReactNode {
  return (
    <styledEl.DotMap aria-hidden data-testid="solver-auction-dot-map">
      {dots.map((kind, index) => (
        <styledEl.Dot key={`${kind}-${index}`} $kind={kind} />
      ))}
    </styledEl.DotMap>
  )
}

function AuctionLegend({
  won,
  alsoBid,
  didntBid,
  total,
}: {
  won: number
  alsoBid: number
  didntBid: number
  total: number
}): ReactNode {
  return (
    <styledEl.Legend>
      <styledEl.LegendItems>
        {won > 0 ? (
          <styledEl.LegendItem>
            <styledEl.LegendDot $kind="won" />
            <Trans>{won} won</Trans>
          </styledEl.LegendItem>
        ) : null}
        {alsoBid > 0 ? (
          <styledEl.LegendItem>
            <styledEl.LegendDot $kind="bid" />
            <Trans>{alsoBid} also bid</Trans>
          </styledEl.LegendItem>
        ) : null}
        {didntBid > 0 ? (
          <styledEl.LegendItem>
            <styledEl.LegendDot $kind="idle" />
            <Trans>{didntBid} didn't bid</Trans>
          </styledEl.LegendItem>
        ) : null}
      </styledEl.LegendItems>
      <styledEl.LegendTotal>
        <Trans>{total} solvers</Trans>
      </styledEl.LegendTotal>
    </styledEl.Legend>
  )
}

function getSolverBuyAmount(solver: SolverCompetition, buyToken: Currency): CurrencyAmount<Currency> | null {
  const rawBuy = solver.executedAmounts?.buy

  if (!rawBuy || !/^\d+$/.test(rawBuy)) {
    return null
  }

  return CurrencyAmount.fromRawAmount(buyToken, rawBuy)
}

function SolverAuctionRow({
  solver,
  index,
  buyToken,
  winnerBuyAmount,
}: {
  solver: SolverCompetition
  index: number
  buyToken?: Currency
  winnerBuyAmount: CurrencyAmount<Currency> | null
}): ReactNode {
  const isWinner = index === 0
  const name = solver.displayName || solver.solver
  const logoSrc = solver.image || AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src
  const buyAmount = buyToken ? getSolverBuyAmount(solver, buyToken) : null
  const deltaAmount =
    !isWinner && winnerBuyAmount && buyAmount && winnerBuyAmount.greaterThan(buyAmount)
      ? winnerBuyAmount.subtract(buyAmount)
      : null

  return (
    <styledEl.Row $isWinner={isWinner}>
      <styledEl.SolverInfo>
        <styledEl.SolverLogo src={logoSrc} alt="" />
        <styledEl.SolverName>
          {name}
          {solver.description ? <InfoTooltip content={solver.description} /> : null}
        </styledEl.SolverName>
      </styledEl.SolverInfo>
      {isWinner ? (
        <styledEl.WinningBadge>
          <styledEl.TrophyIcon aria-hidden>
            <PiTrophyFill />
          </styledEl.TrophyIcon>
          <Trans>Winning solver</Trans>
        </styledEl.WinningBadge>
      ) : null}
      {isWinner && buyAmount ? (
        <styledEl.BidValue $isWinner>
          <TokenAmount amount={buyAmount} tokenSymbol={buyAmount.currency} />
        </styledEl.BidValue>
      ) : null}
      {!isWinner && deltaAmount ? <SolverDeltaValue delta={deltaAmount} /> : null}
    </styledEl.Row>
  )
}

function SolverDeltaValue({ delta }: { delta: CurrencyAmount<Currency> }): ReactNode {
  const { value: usdDelta } = useUsdAmount(delta)

  if (usdDelta) {
    return (
      <styledEl.BidValue>
        -<FiatAmount amount={usdDelta} accurate />
      </styledEl.BidValue>
    )
  }

  return (
    <styledEl.BidValue>
      -<TokenAmount amount={delta} tokenSymbol={delta.currency} />
    </styledEl.BidValue>
  )
}

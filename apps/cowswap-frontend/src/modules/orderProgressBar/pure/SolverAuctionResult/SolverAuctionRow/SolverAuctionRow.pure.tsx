import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getTokenAmountTitle, InfoTooltip, TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { PiTrophyFill } from 'react-icons/pi'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './SolverAuctionRow.styled'

import * as sharedStyledEl from '../shared/SolverAuctionSharedComponents.styled'
import { getSolverBidFillPercent, getSolverBuyAmount } from '../SolverAuctionResult.utils'
import { SolverDeltaValue } from '../SolverDeltaValue/SolverDeltaValue.container'

export interface SolverAuctionRowProps {
  buyToken?: Currency
  index: number
  solver: SolverCompetition
  winnerBuyAmount: CurrencyAmount<Currency> | null
  worstBuyAmount: CurrencyAmount<Currency> | null
}

export function SolverAuctionRow({
  solver,
  index,
  buyToken,
  winnerBuyAmount,
  worstBuyAmount,
}: SolverAuctionRowProps): ReactNode {
  const isWinner = index === 0
  const name = solver.displayName || solver.solver
  const logoSrc = solver.image || AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src
  const buyAmount = buyToken ? getSolverBuyAmount(solver, buyToken) : null
  const fillPercent = !isWinner ? getSolverBidFillPercent(buyAmount, winnerBuyAmount, worstBuyAmount) : null
  const deltaAmount =
    !isWinner && winnerBuyAmount && buyAmount && winnerBuyAmount.greaterThan(buyAmount)
      ? winnerBuyAmount.subtract(buyAmount)
      : null

  return (
    <styledEl.Row $isWinner={isWinner}>
      {fillPercent !== null ? (
        <styledEl.RowFill $percent={fillPercent} data-testid="solver-auction-row-fill" data-percent={fillPercent} />
      ) : null}
      <styledEl.RowContent>
        <styledEl.SolverInfo>
          <styledEl.SolverLogo src={logoSrc} alt="" />
          <styledEl.SolverDetails>
            <styledEl.SolverName>
              {name}
              {solver.description ? <InfoTooltip content={solver.description} /> : null}
            </styledEl.SolverName>
            {isWinner ? (
              <styledEl.WinningBadge>
                <styledEl.TrophyIcon aria-hidden>
                  <PiTrophyFill />
                </styledEl.TrophyIcon>
                <Trans>Winning solver</Trans>
                <styledEl.BadgeTooltip
                  data-testid="solver-auction-winner-info"
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                >
                  <InfoTooltip size={12}>
                    <styledEl.TooltipTitle>
                      <Trans>Why {name} won</Trans>
                    </styledEl.TooltipTitle>
                    <styledEl.TooltipBody>
                      <Trans>
                        You got at least the best price any solver offered for your order on its own. Bundled bids only
                        count if every trader in the bundle gets a fair price.
                      </Trans>
                    </styledEl.TooltipBody>
                  </InfoTooltip>
                </styledEl.BadgeTooltip>
              </styledEl.WinningBadge>
            ) : null}
          </styledEl.SolverDetails>
        </styledEl.SolverInfo>
        {isWinner && buyAmount ? (
          <sharedStyledEl.BidValueTooltip
            content={getTokenAmountTitle({ amount: buyAmount, tokenSymbol: buyAmount.currency })}
            disableHoverablePopup
            placement="top"
          >
            <sharedStyledEl.BidValue $isWinner data-testid="solver-auction-bid-value">
              <TokenAmount amount={buyAmount} noTitle tokenSymbol={buyAmount.currency} />
            </sharedStyledEl.BidValue>
          </sharedStyledEl.BidValueTooltip>
        ) : null}
        {!isWinner && deltaAmount && buyAmount ? <SolverDeltaValue buyAmount={buyAmount} delta={deltaAmount} /> : null}
      </styledEl.RowContent>
    </styledEl.Row>
  )
}

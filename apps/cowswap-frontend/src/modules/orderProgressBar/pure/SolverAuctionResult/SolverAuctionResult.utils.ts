import { formatFiatAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction } from '@cowprotocol/currency'

import { SolverCompetition } from 'common/types/soverCompetition'

export type AuctionDotKind = 'won' | 'bid' | 'idle' | 'placeholder'

export const AUCTION_DOT_COLUMNS = 9
const AUCTION_DOT_MIN_ROWS = 3

export function buildAuctionDots(totalSolvers: number, bidCount: number): AuctionDotKind[] {
  const realSolverCount = Math.max(totalSolvers, bidCount, 0)
  const slotCount = getAuctionDotSlotCount(realSolverCount)

  if (slotCount === 0) {
    return []
  }

  const wonCount = bidCount > 0 ? 1 : 0
  const alsoBidCount = Math.max(bidCount - wonCount, 0)
  const didntBidCount = Math.max(realSolverCount - bidCount, 0)

  const dots: AuctionDotKind[] = []

  if (wonCount > 0) {
    dots.push('won')
  }

  for (let i = 0; i < alsoBidCount && dots.length < slotCount; i++) {
    dots.push('bid')
  }

  for (let i = 0; i < didntBidCount && dots.length < slotCount; i++) {
    dots.push('idle')
  }

  while (dots.length < slotCount) {
    dots.push('placeholder')
  }

  return shuffleAuctionDots(dots, realSolverCount * 17 + bidCount * 31)
}

export function formatSolverBidUsdDelta(usdDelta: CurrencyAmount<Currency>): string {
  const centScale = Math.max(usdDelta.currency.decimals - 2, 0)
  const oneCent = CurrencyAmount.fromRawAmount(usdDelta.currency, 10n ** BigInt(centScale))

  if (usdDelta.greaterThan(0) && usdDelta.lessThan(oneCent)) {
    return '-<$0.01'
  }

  return `-$${formatFiatAmount(usdDelta)}`
}

export function getAuctionDotSlotCount(realSolverCount: number): number {
  const minSlots = AUCTION_DOT_COLUMNS * AUCTION_DOT_MIN_ROWS
  const count = Math.max(realSolverCount, 0)

  if (count <= minSlots) {
    return minSlots
  }

  return Math.ceil(count / AUCTION_DOT_COLUMNS) * AUCTION_DOT_COLUMNS
}

export function getAuctionLegendCounts(
  bidCount: number,
  totalSolvers: number | undefined,
): { won: number; alsoBid: number; didntBid: number; total: number } {
  const total = Math.max(totalSolvers ?? bidCount, bidCount)
  const won = bidCount > 0 ? 1 : 0
  const alsoBid = Math.max(bidCount - won, 0)
  const didntBid = Math.max(total - bidCount, 0)

  return { won, alsoBid, didntBid, total }
}

const BID_FILL_FLOOR_PERCENT = 10
const BID_FILL_SPAN_PERCENT = 90

// The spread runs from the worst bid (0%) to the winner (100%). The floor stays filled so a 0% bid still shows.
export function getSolverBidFillPercent(
  buyAmount: CurrencyAmount<Currency> | null,
  winnerBuyAmount: CurrencyAmount<Currency> | null,
  worstBuyAmount: CurrencyAmount<Currency> | null,
): number | null {
  if (!buyAmount || !winnerBuyAmount || !worstBuyAmount || !winnerBuyAmount.greaterThan(0)) {
    return null
  }

  if (!winnerBuyAmount.greaterThan(worstBuyAmount)) {
    return BID_FILL_FLOOR_PERCENT + BID_FILL_SPAN_PERCENT
  }

  const span = winnerBuyAmount.subtract(worstBuyAmount)
  const aboveWorst = buyAmount.greaterThan(worstBuyAmount)
    ? buyAmount.subtract(worstBuyAmount)
    : CurrencyAmount.fromRawAmount(buyAmount.currency, 0)
  const capped = aboveWorst.greaterThan(span) ? span : aboveWorst
  const spreadPercent = Number(new Fraction(capped.quotient, span.quotient).multiply(100).toSignificant(6))

  if (!Number.isFinite(spreadPercent)) {
    return null
  }

  const clampedSpread = Math.min(100, Math.max(0, spreadPercent))

  return BID_FILL_FLOOR_PERCENT + (clampedSpread / 100) * BID_FILL_SPAN_PERCENT
}

export function getSolverBuyAmount(solver: SolverCompetition, buyToken: Currency): CurrencyAmount<Currency> | null {
  const rawBuy = solver.executedAmounts?.buy

  if (!rawBuy || !/^\d+$/.test(rawBuy)) {
    return null
  }

  return CurrencyAmount.fromRawAmount(buyToken, rawBuy)
}

export function getWorstSolverBuyAmount(
  solvers: readonly SolverCompetition[],
  buyToken: Currency,
): CurrencyAmount<Currency> | null {
  let worst: CurrencyAmount<Currency> | null = null

  for (const solver of solvers) {
    const amount = getSolverBuyAmount(solver, buyToken)

    if (!amount) continue
    if (!worst || amount.lessThan(worst)) worst = amount
  }

  return worst
}

export function isAuctionDotOddRow(index: number): boolean {
  return Math.floor(index / AUCTION_DOT_COLUMNS) % 2 === 0
}

function shuffleAuctionDots(dots: AuctionDotKind[], seed: number): AuctionDotKind[] {
  const shuffled = [...dots]
  let nextSeed = seed

  for (let i = shuffled.length - 1; i > 0; i--) {
    nextSeed = (nextSeed * 1103515245 + 12345) & 0x7fffffff
    const j = nextSeed % (i + 1)
    const current = shuffled[i]
    const swap = shuffled[j]

    if (current === undefined || swap === undefined) {
      continue
    }

    shuffled[i] = swap
    shuffled[j] = current
  }

  return shuffled
}

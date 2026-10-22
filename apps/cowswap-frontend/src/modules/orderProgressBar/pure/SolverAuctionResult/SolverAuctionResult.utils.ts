import { formatFiatAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction } from '@cowprotocol/currency'

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
    return '<$0.01'
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

export function getSolverBidFillPercent(
  buyAmount: CurrencyAmount<Currency> | null,
  winnerBuyAmount: CurrencyAmount<Currency> | null,
): number | null {
  if (!buyAmount || !winnerBuyAmount || !winnerBuyAmount.greaterThan(0)) {
    return null
  }

  const percent = Number(new Fraction(buyAmount.quotient, winnerBuyAmount.quotient).multiply(100).toSignificant(6))

  if (!Number.isFinite(percent)) {
    return null
  }

  return Math.min(100, Math.max(0, percent))
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

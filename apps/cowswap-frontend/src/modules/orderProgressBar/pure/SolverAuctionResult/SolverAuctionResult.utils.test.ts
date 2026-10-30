import { USDC_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import {
  buildAuctionDots,
  formatSolverBidUsdDelta,
  getAuctionDotSlotCount,
  getAuctionLegendCounts,
  getSolverBidFillPercent,
  isAuctionDotOddRow,
} from './SolverAuctionResult.utils'

const buyToken = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'RAI', 'Rai Reflex Index')

describe('SolverAuctionResult.utils', () => {
  describe('getAuctionLegendCounts', () => {
    it('splits won, also bid, and did not bid from totals', () => {
      expect(getAuctionLegendCounts(12, 61)).toEqual({
        won: 1,
        alsoBid: 11,
        didntBid: 49,
        total: 61,
      })
    })

    it('falls back to bid count when total solvers is missing', () => {
      expect(getAuctionLegendCounts(3, undefined)).toEqual({
        won: 1,
        alsoBid: 2,
        didntBid: 0,
        total: 3,
      })
    })
  })

  describe('getAuctionDotSlotCount', () => {
    it('floors at 3 rows of 9 and rounds up to the next multiple of 9 above that', () => {
      expect(getAuctionDotSlotCount(4)).toBe(27)
      expect(getAuctionDotSlotCount(9)).toBe(27)
      expect(getAuctionDotSlotCount(27)).toBe(27)
      expect(getAuctionDotSlotCount(28)).toBe(36)
      expect(getAuctionDotSlotCount(61)).toBe(63)
    })
  })

  describe('isAuctionDotOddRow', () => {
    it('treats the first row as odd and alternates every 9 cells', () => {
      expect(isAuctionDotOddRow(0)).toBe(true)
      expect(isAuctionDotOddRow(8)).toBe(true)
      expect(isAuctionDotOddRow(9)).toBe(false)
      expect(isAuctionDotOddRow(17)).toBe(false)
      expect(isAuctionDotOddRow(18)).toBe(true)
    })
  })

  describe('buildAuctionDots', () => {
    it('fills a 9-column grid with won, bid, idle, and placeholder dots', () => {
      const dots = buildAuctionDots(61, 12)
      const counts = dots.reduce(
        (acc, kind) => {
          acc[kind] += 1
          return acc
        },
        { won: 0, bid: 0, idle: 0, placeholder: 0 },
      )

      expect(dots).toHaveLength(63)
      expect(counts.won).toBe(1)
      expect(counts.bid).toBe(11)
      expect(counts.idle).toBe(49)
      expect(counts.placeholder).toBe(2)
    })

    it('pads with placeholders when real solvers are below the min grid', () => {
      const dots = buildAuctionDots(12, 12)
      const counts = dots.reduce(
        (acc, kind) => {
          acc[kind] += 1
          return acc
        },
        { won: 0, bid: 0, idle: 0, placeholder: 0 },
      )

      expect(dots).toHaveLength(27)
      expect(counts).toEqual({ won: 1, bid: 11, idle: 0, placeholder: 15 })
    })

    it('is deterministic for the same inputs', () => {
      expect(buildAuctionDots(20, 5)).toEqual(buildAuctionDots(20, 5))
    })
  })

  describe('getSolverBidFillPercent', () => {
    const winner = CurrencyAmount.fromRawAmount(buyToken, '100')
    const worst = CurrencyAmount.fromRawAmount(buyToken, '80')

    it('scales the fill from the worst bid to the winner and keeps a 10% floor', () => {
      const mid = CurrencyAmount.fromRawAmount(buyToken, '90')

      expect(getSolverBidFillPercent(worst, winner, worst)).toBe(10)
      expect(getSolverBidFillPercent(mid, winner, worst)).toBe(55)
      expect(getSolverBidFillPercent(winner, winner, worst)).toBe(100)
    })

    it('fills the row when there is no spread between the worst bid and the winner', () => {
      expect(getSolverBidFillPercent(winner, winner, winner)).toBe(100)
    })

    it('caps a bid above the winner at a full row', () => {
      const more = CurrencyAmount.fromRawAmount(buyToken, '150')

      expect(getSolverBidFillPercent(more, winner, worst)).toBe(100)
    })

    it('returns null when a bid amount is missing or the winner is zero', () => {
      expect(getSolverBidFillPercent(null, winner, worst)).toBeNull()
      expect(getSolverBidFillPercent(winner, null, worst)).toBeNull()
      expect(getSolverBidFillPercent(winner, winner, null)).toBeNull()
      expect(getSolverBidFillPercent(winner, CurrencyAmount.fromRawAmount(buyToken, '0'), worst)).toBeNull()
    })
  })

  describe('formatSolverBidUsdDelta', () => {
    it('shows -<$0.01 when the usd gap is below one cent', () => {
      const tiny = CurrencyAmount.fromRawAmount(USDC_MAINNET, '9000')

      expect(formatSolverBidUsdDelta(tiny)).toBe('-<$0.01')
    })

    it('shows -$X when the usd gap is at least one cent', () => {
      const dollar = CurrencyAmount.fromRawAmount(USDC_MAINNET, '1230000')

      expect(formatSolverBidUsdDelta(dollar)).toBe('-$1.23')
    })
  })
})

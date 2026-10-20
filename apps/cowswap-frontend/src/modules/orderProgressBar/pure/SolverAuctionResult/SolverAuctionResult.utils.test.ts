import { buildAuctionDots, getAuctionDotSlotCount, getAuctionLegendCounts } from './SolverAuctionResult.utils'

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
    it('uses 3 rows of 12 plus the real solver count modulo 12', () => {
      expect(getAuctionDotSlotCount(61)).toBe(37)
      expect(getAuctionDotSlotCount(12)).toBe(36)
      expect(getAuctionDotSlotCount(4)).toBe(40)
    })
  })

  describe('buildAuctionDots', () => {
    it('fills a 12-column grid with won, bid, idle, and placeholder dots', () => {
      const dots = buildAuctionDots(61, 12)
      const counts = dots.reduce(
        (acc, kind) => {
          acc[kind] += 1
          return acc
        },
        { won: 0, bid: 0, idle: 0, placeholder: 0 },
      )

      expect(dots).toHaveLength(37)
      expect(counts.won).toBe(1)
      expect(counts.bid).toBe(11)
      expect(counts.idle).toBe(25)
      expect(counts.placeholder).toBe(0)
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

      expect(dots).toHaveLength(36)
      expect(counts).toEqual({ won: 1, bid: 11, idle: 0, placeholder: 24 })
    })

    it('is deterministic for the same inputs', () => {
      expect(buildAuctionDots(20, 5)).toEqual(buildAuctionDots(20, 5))
    })
  })
})

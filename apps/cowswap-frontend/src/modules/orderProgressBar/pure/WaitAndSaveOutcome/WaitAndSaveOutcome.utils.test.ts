import { formatGainPercentLabel, getGainBarLayout, MIN_GAIN_BAR_PX, truncateSymbol } from './WaitAndSaveOutcome.utils'

describe('WaitAndSaveOutcome utils', () => {
  describe('truncateSymbol', () => {
    it('keeps short symbols intact', () => {
      expect(truncateSymbol('USDC')).toBe('USDC')
    })

    it('truncates symbols longer than 12 characters', () => {
      expect(truncateSymbol('SUPERLONGTOKENX')).toBe('SUPERLONGTOK…')
    })
  })

  describe('formatGainPercentLabel', () => {
    it('formats ordinary percents with a plus sign', () => {
      expect(formatGainPercentLabel(1.88)).toBe('+1.88%')
    })

    it('uses a <0.01% pill for tiny gains', () => {
      expect(formatGainPercentLabel(0.004)).toBe('<0.01%')
    })
  })

  describe('getGainBarLayout', () => {
    it('allocates flex proportional to amounts', () => {
      const layout = getGainBarLayout(100, 25)

      expect(layout.aloneFlex).toBeCloseTo(0.8)
      expect(layout.gainFlex).toBeCloseTo(0.2)
      expect(layout.gainMinWidthPx).toBe(MIN_GAIN_BAR_PX)
    })

    it('enforces a minimum gain bar width when there is any gain', () => {
      const layout = getGainBarLayout(10_000, 1)

      expect(layout.gainMinWidthPx).toBe(MIN_GAIN_BAR_PX)
      expect(layout.gainFlex).toBeGreaterThan(0)
    })
  })
})

import {
  fitHeroFontSize,
  formatGainPercentLabel,
  getGainBarLayout,
  HERO_FONT_MAX_PX,
  HERO_FONT_MIN_PX,
  MIN_GAIN_BAR_PX,
} from './WaitAndSaveOutcome.utils'

describe('WaitAndSaveOutcome utils', () => {
  describe('fitHeroFontSize', () => {
    it('keeps the max size when the text already fits', () => {
      const element = createMeasurableElement({ clientWidth: 400, widthPerPx: 5 })

      expect(fitHeroFontSize(element)).toBe(HERO_FONT_MAX_PX)
      expect(element.style.fontSize).toBe(`${HERO_FONT_MAX_PX}px`)
    })

    it('does not shrink before the element has a width', () => {
      const element = createMeasurableElement({ clientWidth: 0, widthPerPx: 20 })

      expect(fitHeroFontSize(element)).toBe(HERO_FONT_MAX_PX)
    })

    it('steps down until the text fits the available width', () => {
      const element = createMeasurableElement({ clientWidth: 400, widthPerPx: 16 })

      expect(fitHeroFontSize(element)).toBe(25)
      expect(element.style.fontSize).toBe('25px')
    })

    it('stops at the minimum size when the text still overflows', () => {
      const element = createMeasurableElement({ clientWidth: 100, widthPerPx: 20 })

      expect(fitHeroFontSize(element)).toBe(HERO_FONT_MIN_PX)
      expect(element.style.fontSize).toBe(`${HERO_FONT_MIN_PX}px`)
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

function createMeasurableElement({ clientWidth, widthPerPx }: { clientWidth: number; widthPerPx: number }): {
  clientWidth: number
  scrollWidth: number
  style: { fontSize: string }
} {
  const element = {
    clientWidth,
    style: { fontSize: '' },
    get scrollWidth() {
      const size = Number.parseFloat(element.style.fontSize) || HERO_FONT_MAX_PX
      return size * widthPerPx
    },
  }

  return element
}

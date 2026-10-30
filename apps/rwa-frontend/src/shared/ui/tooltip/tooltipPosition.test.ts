import { getTooltipPosition } from './tooltipPosition'

const TOOLTIP = { width: 100, height: 30 }

describe('getTooltipPosition', () => {
  it('centers the tooltip above the trigger', () => {
    expect(getTooltipPosition({ top: 100, bottom: 120, left: 200, width: 20 }, TOOLTIP, 1000)).toEqual({
      top: 64,
      left: 160,
    })
  })

  it('places the tooltip below the trigger when there is no room above', () => {
    expect(getTooltipPosition({ top: 20, bottom: 40, left: 200, width: 20 }, TOOLTIP, 1000).top).toBe(46)
  })

  it('keeps the tooltip inside the left edge of the viewport', () => {
    expect(getTooltipPosition({ top: 100, bottom: 120, left: 0, width: 20 }, TOOLTIP, 1000).left).toBe(8)
  })

  it('keeps the tooltip inside the right edge of the viewport', () => {
    expect(getTooltipPosition({ top: 100, bottom: 120, left: 980, width: 20 }, TOOLTIP, 1000).left).toBe(892)
  })
})

import { toTradingViewColor } from './toTradingViewColor'

describe('toTradingViewColor', () => {
  it('converts hex colors to rgba', () => {
    expect(toTradingViewColor('#004293')).toBe('rgba(0, 66, 147, 1)')
    expect(toTradingViewColor('#00234eb3')).toBe('rgba(0, 35, 78, 0.7)')
    expect(toTradingViewColor('#fff')).toBe('rgba(255, 255, 255, 1)')
    expect(toTradingViewColor('#0008')).toBe('rgba(0, 0, 0, 0.53)')
  })

  it('replaces the alpha of the color', () => {
    expect(toTradingViewColor('#00234eb3', 0.33)).toBe('rgba(0, 35, 78, 0.33)')
    expect(toTradingViewColor('#004293', 0)).toBe('rgba(0, 66, 147, 0)')
  })

  it('keeps other colors', () => {
    expect(toTradingViewColor('rgba(0, 35, 78, 0.1)')).toBe('rgba(0, 35, 78, 0.1)')
  })
})

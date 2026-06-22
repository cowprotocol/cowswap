import { clampDrawerWidth } from './useResizableDrawerWidth'

describe('clampDrawerWidth', () => {
  it('does not allow widths below the minimum', () => {
    expect(clampDrawerWidth(200, 1600)).toBe(380)
  })

  it('does not allow widths above viewport minus minimum preview width', () => {
    expect(clampDrawerWidth(2000, 1600)).toBe(1360)
  })

  it('keeps enough room for the preview on smaller viewports', () => {
    expect(clampDrawerWidth(720, 900)).toBe(660)
  })

  it('lowers the effective minimum when the viewport cannot fit both limits', () => {
    expect(clampDrawerWidth(400, 500)).toBe(260)
  })
})

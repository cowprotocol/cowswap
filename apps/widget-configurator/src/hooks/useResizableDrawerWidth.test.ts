import { clampDrawerWidth } from './useResizableDrawerWidth'

describe('clampDrawerWidth', () => {
  it('does not allow widths below the minimum', () => {
    expect(clampDrawerWidth(200, 1600)).toBe(380)
  })

  it('does not allow widths above the configured maximum', () => {
    expect(clampDrawerWidth(900, 1600)).toBe(720)
  })

  it('keeps enough room for the preview on smaller viewports', () => {
    expect(clampDrawerWidth(720, 900)).toBe(540)
  })
})

import { clampScale, MAX_SCALE, zoomAround } from './viewport.utils'

describe('zoomAround', () => {
  it('keeps the wall point under the cursor fixed on screen', () => {
    const view = { scale: 2, offsetX: 30, offsetY: -10 }
    const mx = 200
    const my = 120
    // The wall point under the cursor before zooming.
    const wallX = (mx - view.offsetX) / view.scale
    const wallY = (my - view.offsetY) / view.scale

    zoomAround(view, mx, my, 5)

    expect(view.scale).toBe(5)
    expect(wallX * view.scale + view.offsetX).toBeCloseTo(mx)
    expect(wallY * view.scale + view.offsetY).toBeCloseTo(my)
  })

  it('is a no-op when the scale does not change', () => {
    const view = { scale: 3, offsetX: 10, offsetY: 20 }

    zoomAround(view, 50, 60, 3)

    expect(view).toEqual({ scale: 3, offsetX: 10, offsetY: 20 })
  })

  it('zooming in then back out restores the view', () => {
    const view = { scale: 1.5, offsetX: 12, offsetY: -7 }

    zoomAround(view, 90, 40, 6)
    zoomAround(view, 90, 40, 1.5)

    expect(view.offsetX).toBeCloseTo(12)
    expect(view.offsetY).toBeCloseTo(-7)
  })
})

describe('clampScale', () => {
  it('caps at the maximum', () => {
    expect(clampScale(1000, 0.1)).toBe(MAX_SCALE)
  })

  it('floors at the minimum', () => {
    expect(clampScale(0.001, 0.25)).toBe(0.25)
  })

  it('passes through values in range', () => {
    expect(clampScale(3, 0.1)).toBe(3)
  })
})

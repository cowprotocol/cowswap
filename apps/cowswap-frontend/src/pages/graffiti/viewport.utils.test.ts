import { CANVAS, setCanvasSize } from './raster.utils'
import { clampScale, computeMinScale, coverView, fitView, MAX_SCALE, zoomAround } from './viewport.utils'

/** `fitView` and friends only ever read the canvas' CSS box. */
function stage(clientWidth: number, clientHeight: number): HTMLCanvasElement {
  return { clientWidth, clientHeight } as HTMLCanvasElement
}

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

describe('fitView', () => {
  beforeEach(() => setCanvasSize(4096, 2048))

  it('shows the whole wall, touching the stage on the tight axis', () => {
    const view = fitView(stage(1600, 900))

    // 1600/4096 is tighter than 900/2048, so width is what the wall is fitted to.
    expect(view.scale).toBeCloseTo(1600 / 4096)
    expect(view.offsetX).toBeCloseTo(0)
    expect(CANVAS.h * view.scale).toBeLessThanOrEqual(900)
  })

  it('centres the letterboxed axis', () => {
    const view = fitView(stage(1600, 900))

    expect(view.offsetY).toBeCloseTo((900 - CANVAS.h * view.scale) / 2)
    expect(view.offsetY).toBeGreaterThan(0)
  })
})

describe('coverView', () => {
  beforeEach(() => setCanvasSize(4096, 2048))

  it('fills the stage on both axes', () => {
    const view = coverView(stage(1600, 900))

    expect(CANVAS.w * view.scale).toBeGreaterThanOrEqual(1600)
    expect(CANVAS.h * view.scale).toBeGreaterThanOrEqual(900)
  })

  it('crops the overflowing axis symmetrically', () => {
    const view = coverView(stage(1600, 900))

    // 900/2048 wins, so the wall is wider than the stage and hangs off both sides.
    expect(view.scale).toBeCloseTo(900 / 2048)
    expect(view.offsetX).toBeLessThan(0)
    expect(view.offsetY).toBeCloseTo(0)
    expect(view.offsetX).toBeCloseTo((1600 - CANVAS.w * view.scale) / 2)
  })

  it('crops vertically when the stage is wider than the wall', () => {
    const view = coverView(stage(4096, 800))

    expect(view.scale).toBeCloseTo(1)
    expect(view.offsetX).toBeCloseTo(0)
    expect(view.offsetY).toBeCloseTo((800 - 2048) / 2)
  })
})

describe('computeMinScale', () => {
  beforeEach(() => setCanvasSize(4096, 2048))

  it('floors at the whole wall, so zooming out always reveals everything', () => {
    expect(computeMinScale(stage(1600, 900))).toBeCloseTo(1600 / 4096)
  })

  it('falls back when nothing is mounted', () => {
    expect(computeMinScale(null)).toBeGreaterThan(0)
  })
})

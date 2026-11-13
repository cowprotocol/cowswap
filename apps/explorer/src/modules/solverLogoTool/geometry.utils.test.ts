import { clippedFraction, fitMark, imageRect, solverSlug } from './geometry.utils'

describe('solver logo positioning', () => {
  it('preserves proportions and resolution-independent offsets', () => {
    const source = { width: 200, height: 100 },
      state = { scale: 80, x: 10, y: -5 }
    expect(imageRect(source, state, 1000)).toEqual({ x: 200, y: 250, width: 800, height: 400 })
    expect(imageRect(source, state, 100)).toEqual({ x: 20, y: 25, width: 80, height: 40 })
  })
  it('fits padded, off-centre artwork beyond 200% without clipping', () => {
    const source = {
      width: 1000,
      height: 1000,
      bounds: { x: 0.8, y: 0.1, width: 0.1, height: 0.1 },
      inkPoints: [
        [0.8, 0.1],
        [0.9, 0.1],
        [0.8, 0.2],
        [0.9, 0.2],
      ] as [number, number][],
    }
    const fitted = fitMark(source)
    expect(fitted.scale).toBeGreaterThan(200)
    expect(fitted.scale).toBeLessThanOrEqual(800)
    expect(fitted.x).toBeLessThan(-100)
    expect(clippedFraction(source, { ...fitted, background: 'transparent' })).toBe(0)
  })
  it('removes traversal and markup from exported solver names', () => {
    expect(solverSlug('../../Défusion <script>')).toBe('defusion-script')
    expect(solverSlug('   ')).toBe('solver')
  })
})

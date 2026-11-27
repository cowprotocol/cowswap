import { computeDraftBox, isDraftTooBig } from './draftBox.utils'

const WIDTH = 1000
const idx = (x: number, y: number): number => y * WIDTH + x

describe('computeDraftBox', () => {
  it('returns null for an empty draft', () => {
    expect(computeDraftBox(new Map(), WIDTH)).toBeNull()
  })

  it('wraps a single cell', () => {
    expect(computeDraftBox(new Map([[idx(5, 7), 1]]), WIDTH)).toEqual({ x: 5, y: 7, w: 1, h: 1 })
  })

  it('wraps scattered cells', () => {
    const draft = new Map([
      [idx(10, 20), 1],
      [idx(14, 20), 1],
      [idx(12, 29), 1],
    ])
    expect(computeDraftBox(draft, WIDTH)).toEqual({ x: 10, y: 20, w: 5, h: 10 })
  })
})

describe('isDraftTooBig', () => {
  const box = (w: number, h: number): { x: number; y: number; w: number; h: number } => ({ x: 0, y: 0, w, h })

  it('accepts an empty draft', () => {
    expect(isDraftTooBig(null, 256, 128)).toBe(false)
  })

  it('accepts a full landscape frame', () => {
    expect(isDraftTooBig(box(256, 128), 256, 128)).toBe(false)
  })

  it('accepts a full portrait frame, which the backend allows', () => {
    expect(isDraftTooBig(box(128, 256), 256, 128)).toBe(false)
  })

  it('accepts a tall portrait draft that a landscape-only check would wrongly reject', () => {
    expect(isDraftTooBig(box(100, 200), 256, 128)).toBe(false)
  })

  it('rejects a draft too long on its long side', () => {
    expect(isDraftTooBig(box(257, 10), 256, 128)).toBe(true)
    expect(isDraftTooBig(box(10, 257), 256, 128)).toBe(true)
  })

  it('rejects a draft large in both directions', () => {
    expect(isDraftTooBig(box(200, 200), 256, 128)).toBe(true)
  })

  it('honours a server-configured box size', () => {
    expect(isDraftTooBig(box(300, 100), 512, 256)).toBe(false)
    expect(isDraftTooBig(box(300, 300), 512, 256)).toBe(true)
  })
})

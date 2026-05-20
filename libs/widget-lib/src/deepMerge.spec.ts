import { deepMerge } from './deepMerge'

describe('deepMerge', () => {
  it('fills missing keys from base', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('lets overrides win for primitives', () => {
    expect(deepMerge({ a: 2 }, { a: 1, b: 0 })).toEqual({ a: 2, b: 0 })
  })

  it('merges nested plain objects', () => {
    const base = { nested: { x: 0, y: 1 }, z: 9 }
    const overrides = { nested: { x: 2 } }
    expect(deepMerge(overrides, base)).toEqual({ nested: { x: 2, y: 1 }, z: 9 })
  })

  it('clones override-only nested objects without mutating inputs', () => {
    const inner = { only: true }
    const overrides = { nested: inner }
    const base = {}
    const out = deepMerge(overrides, base)
    expect(out).toEqual({ nested: { only: true } })
    expect(out.nested).not.toBe(inner)
  })

  it('does not mutate arguments', () => {
    const a = { nested: { x: 1 } }
    const b = { nested: { y: 2 }, z: 3 }
    deepMerge(a, b)
    expect(a).toEqual({ nested: { x: 1 } })
    expect(b).toEqual({ nested: { y: 2 }, z: 3 })
  })

  it('treats arrays as leaves', () => {
    expect(deepMerge({ items: [1, 2] }, { items: [9] })).toEqual({ items: [1, 2] })
  })

  it('uses base when override key is undefined', () => {
    const overrides: { a: number | undefined } = { a: undefined }
    expect(deepMerge(overrides, { a: 1 })).toEqual({ a: 1 })
  })
})

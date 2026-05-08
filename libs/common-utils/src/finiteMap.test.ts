import { FiniteMap } from './finiteMap'

describe('FiniteMap', () => {
  it('throws for non-positive maxSize', () => {
    expect(() => new FiniteMap<string, string>(0)).toThrow('FiniteMap maxSize must be a positive integer')
    expect(() => new FiniteMap<string, string>(-1)).toThrow('FiniteMap maxSize must be a positive integer')
  })

  it('stores and retrieves values', () => {
    const map = new FiniteMap<string, number>(2)
    map.set('a', 1)

    expect(map.get('a')).toBe(1)
    expect(map.has('a')).toBe(true)
    expect(map.size).toBe(1)
  })

  it('evicts oldest entry when exceeding max size', () => {
    const map = new FiniteMap<string, number>(2)
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)

    expect(map.get('a')).toBeUndefined()
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(2)
  })

  it('refreshes recency on get (LRU behavior)', () => {
    const map = new FiniteMap<string, number>(2)
    map.set('a', 1)
    map.set('b', 2)

    // Refresh "a", so "b" becomes oldest
    expect(map.get('a')).toBe(1)
    map.set('c', 3)

    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBeUndefined()
    expect(map.get('c')).toBe(3)
  })
})

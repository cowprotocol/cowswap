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
    expect([...map.keys()]).toEqual(['a'])
  })

  it('evicts oldest entry when exceeding max size', () => {
    const map = new FiniteMap<string, number>(2)
    map.set('a', 1)
    map.set('b', 2)
    expect([...map.keys()]).toEqual(['a', 'b'])

    map.set('c', 3)

    expect([...map.keys()]).toEqual(['b', 'c'])
    expect(map.get('a')).toBeUndefined()
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(2)
  })

  it('refreshes recency on get (LRU behavior)', () => {
    const map = new FiniteMap<string, number>(2)
    map.set('a', 1)
    map.set('b', 2)
    expect([...map.keys()]).toEqual(['a', 'b'])

    // Refresh "a", so "b" becomes oldest
    expect(map.get('a')).toBe(1)
    expect([...map.keys()]).toEqual(['b', 'a'])
    map.set('c', 3)

    expect([...map.keys()]).toEqual(['a', 'c'])
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBeUndefined()
    expect(map.get('c')).toBe(3)
  })

  it('refreshes recency when stored value is undefined', () => {
    const map = new FiniteMap<string, number | undefined>(2)
    map.set('a', undefined)
    map.set('b', 2)
    expect([...map.keys()]).toEqual(['a', 'b'])

    // Accessing "a" should refresh it even though its value is undefined.
    expect(map.get('a')).toBeUndefined()
    expect(map.has('a')).toBe(true)
    expect([...map.keys()]).toEqual(['b', 'a'])

    map.set('c', 3)

    expect([...map.keys()]).toEqual(['a', 'c'])
    expect(map.has('a')).toBe(true)
    expect(map.get('b')).toBeUndefined()
    expect(map.get('c')).toBe(3)
  })

  it('evicts undefined key when it is the oldest entry', () => {
    const map = new FiniteMap<string | undefined, number>(2)
    map.set(undefined, 1)
    map.set('b', 2)
    expect([...map.keys()]).toEqual([undefined, 'b'])
    map.set('c', 3)

    expect([...map.keys()]).toEqual(['b', 'c'])
    expect(map.has(undefined)).toBe(false)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('does not refresh recency when getting a missing key', () => {
    const map = new FiniteMap<string, number>(2)
    map.set('a', 1)
    map.set('b', 2)
    expect([...map.keys()]).toEqual(['a', 'b'])

    expect(map.get('missing')).toBeUndefined()
    expect([...map.keys()]).toEqual(['a', 'b'])
    map.set('c', 3)

    expect([...map.keys()]).toEqual(['b', 'c'])
    // "a" remains oldest because reading a missing key should not mutate order.
    expect(map.get('a')).toBeUndefined()
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })
})

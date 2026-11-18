import { getEditDistance } from './editDistance'

describe('getEditDistance', () => {
  it('is 0 for equal strings', () => {
    expect(getEditDistance('nvidia', 'nvidia')).toBe(0)
  })

  it('is the other length when one string is empty', () => {
    expect(getEditDistance('', 'meta')).toBe(4)
    expect(getEditDistance('meta', '')).toBe(4)
  })

  it('counts substitutions, insertions and deletions', () => {
    expect(getEditDistance('nvidea', 'nvidia')).toBe(1)
    expect(getEditDistance('aple', 'apple')).toBe(1)
    expect(getEditDistance('teslaa', 'tesla')).toBe(1)
    expect(getEditDistance('kitten', 'sitting')).toBe(3)
  })

  it('counts a swap of adjacent chars as one edit', () => {
    expect(getEditDistance('telsa', 'tesla')).toBe(1)
    expect(getEditDistance('googel', 'google')).toBe(1)
  })

  it('edits a substring at most once', () => {
    expect(getEditDistance('ca', 'abc')).toBe(3)
  })
})

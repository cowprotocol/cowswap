import { getLevenshteinDistance } from './levenshtein'

describe('getLevenshteinDistance', () => {
  it('is 0 for equal strings', () => {
    expect(getLevenshteinDistance('nvidia', 'nvidia')).toBe(0)
  })

  it('is the other length when one string is empty', () => {
    expect(getLevenshteinDistance('', 'meta')).toBe(4)
    expect(getLevenshteinDistance('meta', '')).toBe(4)
  })

  it('counts substitutions, insertions and deletions', () => {
    expect(getLevenshteinDistance('nvidea', 'nvidia')).toBe(1)
    expect(getLevenshteinDistance('aple', 'apple')).toBe(1)
    expect(getLevenshteinDistance('teslaa', 'tesla')).toBe(1)
    expect(getLevenshteinDistance('kitten', 'sitting')).toBe(3)
  })

  it('counts a transposition as two edits', () => {
    expect(getLevenshteinDistance('googel', 'google')).toBe(2)
  })
})

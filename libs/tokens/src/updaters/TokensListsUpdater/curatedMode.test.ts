import { shouldInvalidateLastUpdateTime } from './curatedMode'

describe('TokensListsUpdater curated mode', () => {
  it('invalidates the cache only when curated mode expands back to the full source set', () => {
    expect(shouldInvalidateLastUpdateTime(true, false)).toBe(true)
    expect(shouldInvalidateLastUpdateTime(undefined, false)).toBe(false)
    expect(shouldInvalidateLastUpdateTime(false, false)).toBe(false)
    expect(shouldInvalidateLastUpdateTime(false, true)).toBe(false)
    expect(shouldInvalidateLastUpdateTime(true, true)).toBe(false)
  })
})

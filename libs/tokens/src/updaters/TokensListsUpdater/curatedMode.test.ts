import {
  shouldInvalidateLastUpdateTime,
  shouldUseCuratedModeForCountry,
  shouldUseCuratedModeForGeoResponse,
} from './curatedMode'

describe('TokensListsUpdater curated mode', () => {
  it('invalidates the cache only when curated mode expands back to the full source set', () => {
    expect(shouldInvalidateLastUpdateTime(true, false)).toBe(true)
    expect(shouldInvalidateLastUpdateTime(undefined, false)).toBe(false)
    expect(shouldInvalidateLastUpdateTime(false, false)).toBe(false)
    expect(shouldInvalidateLastUpdateTime(false, true)).toBe(false)
    expect(shouldInvalidateLastUpdateTime(true, true)).toBe(false)
  })

  it('fails closed for missing or malformed geo country values', () => {
    expect(shouldUseCuratedModeForGeoResponse({})).toBe(true)
    expect(shouldUseCuratedModeForGeoResponse({ country: null })).toBe(true)
    expect(shouldUseCuratedModeForGeoResponse({ country: 'USA' })).toBe(true)
    expect(shouldUseCuratedModeForGeoResponse({ country: '1!' })).toBe(true)
  })

  it('normalizes valid country values before deciding curated mode', () => {
    expect(shouldUseCuratedModeForCountry('us')).toBe(true)
    expect(shouldUseCuratedModeForCountry(' US ')).toBe(true)
    expect(shouldUseCuratedModeForCountry('pt')).toBe(false)
  })
})

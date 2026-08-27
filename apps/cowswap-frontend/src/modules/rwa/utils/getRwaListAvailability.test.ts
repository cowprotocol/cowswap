import { getRwaListAvailability } from './getRwaListAvailability'

describe('getRwaListAvailability', () => {
  it('stays loading while feature flags are unresolved', () => {
    expect(
      getRwaListAvailability({
        isEnabled: true,
        areFeatureFlagsLoading: true,
        isGeoBlockEnabled: false,
        areRestrictedListsLoaded: true,
        restrictedCountries: ['US'],
        geoCountry: 'US',
        isGeoLoading: false,
        geoError: null,
      }),
    ).toBe('loading')
  })

  it('stays loading until restricted-list and geo decisions are settled', () => {
    expect(
      getRwaListAvailability({
        isEnabled: true,
        areFeatureFlagsLoading: false,
        isGeoBlockEnabled: true,
        areRestrictedListsLoaded: false,
        restrictedCountries: undefined,
        geoCountry: null,
        isGeoLoading: false,
        geoError: null,
      }),
    ).toBe('loading')
  })

  it('is unavailable when the settled country is restricted', () => {
    expect(
      getRwaListAvailability({
        isEnabled: true,
        areFeatureFlagsLoading: false,
        isGeoBlockEnabled: true,
        areRestrictedListsLoaded: true,
        restrictedCountries: ['US'],
        geoCountry: 'us',
        isGeoLoading: false,
        geoError: null,
      }),
    ).toBe('unavailable')
  })

  it('is available when geoblocking is disabled', () => {
    expect(
      getRwaListAvailability({
        isEnabled: true,
        areFeatureFlagsLoading: false,
        isGeoBlockEnabled: false,
        areRestrictedListsLoaded: false,
        restrictedCountries: undefined,
        geoCountry: null,
        isGeoLoading: false,
        geoError: null,
      }),
    ).toBe('available')
  })
})

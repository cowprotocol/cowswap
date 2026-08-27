export type RwaListAvailability = 'loading' | 'available' | 'unavailable'

export interface RwaListAvailabilityContext {
  isEnabled: boolean
  areFeatureFlagsLoading: boolean
  isGeoBlockEnabled: boolean
  areRestrictedListsLoaded: boolean
  restrictedCountries: string[] | undefined
  geoCountry: string | null
  isGeoLoading: boolean
  geoError: string | null
}

export function getRwaListAvailability(context: RwaListAvailabilityContext): RwaListAvailability {
  const {
    isEnabled,
    areFeatureFlagsLoading,
    isGeoBlockEnabled,
    areRestrictedListsLoaded,
    restrictedCountries,
    geoCountry,
    isGeoLoading,
    geoError,
  } = context

  if (!isEnabled) return 'unavailable'
  if (areFeatureFlagsLoading) return 'loading'
  if (!isGeoBlockEnabled) return 'available'

  const isGeoSettled = isGeoStatusSettled(geoCountry, isGeoLoading, geoError)
  if (!areRestrictedListsLoaded || !isGeoSettled) return 'loading'

  const isRestricted = geoCountry ? restrictedCountries?.includes(geoCountry.toUpperCase()) === true : false

  return isRestricted ? 'unavailable' : 'available'
}

function isGeoStatusSettled(geoCountry: string | null, isGeoLoading: boolean, geoError: string | null): boolean {
  if (isGeoLoading) return false

  return geoCountry !== null || geoError !== null
}

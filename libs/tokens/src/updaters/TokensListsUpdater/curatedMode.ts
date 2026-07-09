export function shouldInvalidateLastUpdateTime(
  previousCuratedMode: boolean | undefined,
  nextCuratedMode: boolean,
): boolean {
  return previousCuratedMode === true && nextCuratedMode === false
}

export function shouldUseCuratedModeForGeoResponse(responseBody: unknown): boolean {
  if (!responseBody || typeof responseBody !== 'object' || !('country' in responseBody)) {
    return true
  }

  return shouldUseCuratedModeForCountry(responseBody.country)
}

export function shouldUseCuratedModeForCountry(country: unknown): boolean {
  if (typeof country !== 'string') {
    return true
  }

  const normalizedCountry = country.trim().toUpperCase()

  if (!/^[A-Z]{2}$/.test(normalizedCountry)) {
    return true
  }

  return normalizedCountry === 'US'
}

import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { fetchGeoDataAtom, geoDataAtom } from '../state/geoDataAtom'

/**
 * Hook to get the user's country code.
 * Returns the country code (e.g., 'US', 'DE') or null if unknown/loading.
 * Automatically fetches geo data on first call.
 */
export function useGeoCountry(): string | null {
  const geoData = useAtomValue(geoDataAtom)
  const fetchGeoData = useSetAtom(fetchGeoDataAtom)

  useEffect(() => {
    fetchGeoData()
  }, [fetchGeoData])

  if (geoData.isLoading || geoData.error) {
    return null
  }

  return geoData.country
}


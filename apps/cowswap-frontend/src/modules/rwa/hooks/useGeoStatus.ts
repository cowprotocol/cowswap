import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { fetchGeoDataAtom, GeoData, geoDataAtom } from '../state/geoDataAtom'

/**
 * Hook to get the user's geo status with loading/error states.
 * Use this when you need to differentiate between loading and error states.
 */
export function useGeoStatus(): GeoData {
  const geoData = useAtomValue(geoDataAtom)
  const fetchGeoData = useSetAtom(fetchGeoDataAtom)

  useEffect(() => {
    fetchGeoData()
  }, [fetchGeoData])

  return geoData
}

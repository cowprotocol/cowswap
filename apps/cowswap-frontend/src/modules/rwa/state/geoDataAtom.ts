import { atom } from 'jotai'

export interface GeoData {
  country: string | null
  isLoading: boolean
  error: string | null
}

const initialGeoData: GeoData = {
  country: null,
  isLoading: false,
  error: null,
}

export const geoDataAtom = atom<GeoData>(initialGeoData)

export const fetchGeoDataAtom = atom(null, async (get, set) => {
  const current = get(geoDataAtom)

  // Don't fetch if already loaded or loading
  if (current.country !== null || current.isLoading) {
    return
  }

  set(geoDataAtom, { ...current, isLoading: true })

  try {
    const response = await fetch('https://api.country.is')
    const data = await response.json()

    set(geoDataAtom, {
      country: data.country || null,
      isLoading: false,
      error: null,
    })
  } catch (error) {
    set(geoDataAtom, {
      country: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch geo data',
    })
  }
})

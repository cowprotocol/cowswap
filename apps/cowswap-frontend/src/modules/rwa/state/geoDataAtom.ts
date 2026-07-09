import { atom } from 'jotai'

export interface GeoData {
  country: string | null
  isLoading: boolean
  isLoaded: boolean
  error: string | null
}

const initialGeoData: GeoData = {
  country: null,
  isLoading: false,
  isLoaded: false,
  error: null,
}

export const geoDataAtom = atom<GeoData>(initialGeoData)

function getCountryFromResponseBody(responseBody: unknown): string | null {
  if (!responseBody || typeof responseBody !== 'object' || !('country' in responseBody)) {
    return null
  }

  const country = responseBody.country

  if (typeof country !== 'string') {
    return null
  }

  const normalizedCountry = country.trim().toUpperCase()

  return /^[A-Z]{2}$/.test(normalizedCountry) ? normalizedCountry : null
}

async function fetchCountry(): Promise<string> {
  const response = await fetch('https://api.country.is')

  if (!response.ok) {
    throw new Error(`Geo lookup failed: ${response.status}`)
  }

  const responseBody: unknown = await response.json()
  const country = getCountryFromResponseBody(responseBody)

  if (!country) {
    throw new Error('Geo lookup returned an invalid country')
  }

  return country
}

async function doFetchGeoData(set: (update: GeoData) => void, current: GeoData): Promise<void> {
  set({ ...current, isLoading: true })

  try {
    const country = await fetchCountry()

    set({
      country,
      isLoading: false,
      isLoaded: true,
      error: null,
    })
  } catch (error) {
    set({
      country: null,
      isLoading: false,
      isLoaded: true,
      error: error instanceof Error ? error.message : 'Failed to fetch geo data',
    })
  }
}

export const fetchGeoDataAtom = atom(null, async (get, set) => {
  const current = get(geoDataAtom)

  if (current.isLoaded || current.isLoading) {
    return
  }

  await doFetchGeoData((update) => set(geoDataAtom, update), current)
})

// for cases when user changes wallet
export const refetchGeoDataAtom = atom(null, async (get, set) => {
  const current = get(geoDataAtom)

  if (current.isLoading) {
    return
  }

  await doFetchGeoData((update) => set(geoDataAtom, update), current)
})

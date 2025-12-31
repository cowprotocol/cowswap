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

async function doFetchGeoData(set: (update: GeoData) => void, current: GeoData): Promise<void> {
  set({ ...current, isLoading: true })

  try {
    const response = await fetch('https://api.country.is')
    const data = await response.json()

    set({
      country: data.country || null,
      isLoading: false,
      error: null,
    })
  } catch (error) {
    set({
      country: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch geo data',
    })
  }
}

export const fetchGeoDataAtom = atom(null, async (get, set) => {
  const current = get(geoDataAtom)

  if (current.country !== null || current.isLoading) {
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

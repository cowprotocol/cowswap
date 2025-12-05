import { GeoMode } from '../types/rwaConsent'

export type GeoStatus = 'ALLOWED' | 'BLOCKED' | 'UNKNOWN'

// For RWA consent modal, we only need to know if it's UNKNOWN
// The modal is shown only when geoStatus is UNKNOWN
export function useGeoStatus(): GeoStatus {
  // TODO: Implement actual geo status fetching
  // For now, return UNKNOWN as the modal is only shown in this case
  return 'UNKNOWN'
}

export function geoStatusToGeoMode(geoStatus: GeoStatus): GeoMode {
  return geoStatus === 'ALLOWED' ? 'ALLOWED' : 'UNKNOWN'
}


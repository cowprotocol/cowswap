import { GeoMode } from '../types/rwaConsent'

export type GeoStatus = 'ALLOWED' | 'BLOCKED' | 'UNKNOWN'

export function useGeoStatus(): GeoStatus {
  return 'UNKNOWN'
}

export function geoStatusToGeoMode(geoStatus: GeoStatus): GeoMode {
  return geoStatus === 'ALLOWED' ? 'ALLOWED' : 'UNKNOWN'
}


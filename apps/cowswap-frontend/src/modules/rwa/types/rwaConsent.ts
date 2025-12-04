export type GeoMode = 'ALLOWED' | 'UNKNOWN'

export interface RwaConsentRecord {
  confirmed: boolean
  geoMode: GeoMode
  confirmedAt: number
}

export interface RwaConsentKey {
  wallet: string
  issuer: string
  tosVersion: string
}

export function getRwaConsentStorageKey({ wallet, issuer, tosVersion }: RwaConsentKey): string {
  return `rwaConsent:${wallet}:${issuer}:${tosVersion}`
}


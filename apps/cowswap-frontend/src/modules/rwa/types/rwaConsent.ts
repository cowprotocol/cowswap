export interface RwaConsentRecord {
  acceptedAt: number
}

export interface RwaConsentKey {
  wallet: string
  tosVersion: string
}

export function getRwaConsentStorageKey({ wallet, tosVersion }: RwaConsentKey): string {
  return `rwaConsent:${wallet}:${tosVersion}`
}


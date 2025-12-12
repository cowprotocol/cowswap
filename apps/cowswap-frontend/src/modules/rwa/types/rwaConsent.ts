export interface RwaUserConsent {
  terms: string
  acceptedDate: string
}

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

export function buildRwaUserConsent(termsIpfsHash: string): RwaUserConsent {
  return {
    terms: termsIpfsHash,
    acceptedDate: new Date().toISOString(),
  }
}


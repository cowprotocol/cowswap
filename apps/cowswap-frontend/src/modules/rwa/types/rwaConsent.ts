export interface UserConsent {
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

export function buildUserConsent(termsIpfsHash: string): UserConsent {
  return {
    terms: termsIpfsHash,
    acceptedDate: new Date().toISOString(),
  }
}

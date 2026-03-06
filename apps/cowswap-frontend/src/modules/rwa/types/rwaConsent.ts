export type RwaConsentCacheKey = `${string}-${string}`

export interface RwaConsentKey {
  wallet: string
  ipfsHash: string
}

export interface RwaConsentRecord {
  /** ISO 8601 date string when consent was accepted */
  acceptedAt: string
}

export interface UserConsent {
  terms: string
  acceptedDate: string
}

export function buildRwaConsentKey({ wallet, ipfsHash }: RwaConsentKey): RwaConsentCacheKey {
  return `${wallet.toLowerCase()}-${ipfsHash}`
}

export function buildUserConsent(termsIpfsHash: string, acceptedAt: string): UserConsent {
  return {
    terms: termsIpfsHash,
    acceptedDate: acceptedAt,
  }
}

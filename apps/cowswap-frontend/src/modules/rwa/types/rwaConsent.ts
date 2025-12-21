export interface UserConsent {
  terms: string
  acceptedDate: string
}

export interface RwaConsentRecord {
  acceptedAt: number
}

export interface RwaConsentKey {
  wallet: string
  ipfsHash: string
}

export type ConsentKey = `rwaConsent:${string}:${string}`

export function getRwaConsentStorageKey({ wallet, ipfsHash }: RwaConsentKey): ConsentKey {
  return `rwaConsent:${wallet}:${ipfsHash}`
}

export type RwaConsentCacheKey = `${string}-${string}`

export function buildRwaConsentKey({ wallet, ipfsHash }: RwaConsentKey): RwaConsentCacheKey {
  return `${wallet.toLowerCase()}-${ipfsHash}`
}

export function buildUserConsent(termsIpfsHash: string, acceptedAt: number): UserConsent {
  return {
    terms: termsIpfsHash,
    acceptedDate: new Date(acceptedAt).toISOString(),
  }
}

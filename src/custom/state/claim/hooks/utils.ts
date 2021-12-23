import { FREE_CLAIM_TYPES, PAID_CLAIM_TYPES, UserClaims } from 'state/claim/hooks/index'

/**
 * Helper function to check whether any claim is an investment option
 *
 * @param claims
 */
export function hasPaidClaim(claims: UserClaims | null): boolean {
  return claims?.some((claim) => claim.type in PAID_CLAIM_TYPES) || false
}

/**
 * Helper function to check whether any claim is an airdrop option
 *
 * @param claims
 */
export function hasFreeClaim(claims: UserClaims | null): boolean {
  return claims?.some((claim) => claim.type in FREE_CLAIM_TYPES) || false
}

import crypto from 'node:crypto'

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const CLAIM_CODE_LENGTH = 22

/**
 * Claim codes are bearer tokens, so they must come from a CSPRNG. Bytes >= 232
 * are discarded: 256 is not a multiple of 58, and keeping them would bias the
 * first 24 letters of the alphabet.
 */
export function generateClaimCode(): string {
  const limit = 256 - (256 % BASE58_ALPHABET.length) // 232
  let code = ''
  while (code.length < CLAIM_CODE_LENGTH) {
    const bytes = crypto.randomBytes(CLAIM_CODE_LENGTH)
    for (const byte of bytes) {
      if (byte >= limit) continue
      code += BASE58_ALPHABET[byte % BASE58_ALPHABET.length]
      if (code.length === CLAIM_CODE_LENGTH) break
    }
  }
  return code
}

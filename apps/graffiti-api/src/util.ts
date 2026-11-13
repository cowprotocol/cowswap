import { PublicKey } from '@solana/web3.js'

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/** Parse a base58 address, or null when it is not a valid public key. */
export function parsePublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address)
  } catch {
    return null
  }
}

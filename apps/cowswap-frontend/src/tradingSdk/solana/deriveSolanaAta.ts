import { getAssociatedTokenAddressSync } from '@solana/spl-token'

import type { PublicKey } from '@solana/web3.js'

/**
 * Associated token account of `owner` for `mint`.
 *
 * Derived with `allowOwnerOffCurve`: an owner or receiver may be a program address rather than a
 * keypair — a multisig vault is a PDA, so it is off the ed25519 curve by construction — and the default
 * guard rejects one with `TokenOwnerOffCurveError`. That guard only ever caught a token account passed
 * where an owner belongs, which it cannot do reliably anyway, since a token account can be on-curve.
 */
export function deriveSolanaAta(mint: PublicKey, owner: PublicKey, tokenProgram?: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, true, tokenProgram)
}

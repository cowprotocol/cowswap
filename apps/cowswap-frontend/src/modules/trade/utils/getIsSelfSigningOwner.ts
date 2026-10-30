import { PublicKey } from '@solana/web3.js'

/**
 * Whether `owner` can sign a transaction on its own.
 *
 * A program-derived address — a Squads multisig vault, for one — has no private key: its authority
 * exists only inside a CPI from the program that owns it, which is why a vault's order reaches the
 * chain nested in `VaultTransactionExecute`. Such addresses are off the ed25519 curve by
 * construction, and that is what tells them apart from an ordinary keypair.
 *
 * Throws on anything that is not a Solana address: callers holding a bare string must know it came
 * from a Solana chain.
 */
export function getIsSelfSigningOwner(owner: PublicKey | string): boolean {
  return PublicKey.isOnCurve(owner)
}

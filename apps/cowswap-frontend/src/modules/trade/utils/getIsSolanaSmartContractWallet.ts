import { PublicKey } from '@solana/web3.js'

/**
 * Whether `owner` is program-owned rather than an ordinary keypair — the Solana counterpart of an EVM
 * smart contract wallet, a Squads multisig vault being the case that reaches this code.
 *
 * Such an address is program-derived and has no private key: its authority exists only inside a CPI
 * from the program that owns it, which is why a vault's order reaches the chain nested in
 * `VaultTransactionExecute` rather than as a top-level instruction it signed itself. Program-derived
 * addresses are off the ed25519 curve by construction, and that is what tells them apart.
 *
 * Throws on anything that is not a Solana address: callers holding a bare string must know it came
 * from a Solana chain.
 */
export function getIsSolanaSmartContractWallet(owner: PublicKey | string): boolean {
  return !PublicKey.isOnCurve(owner)
}

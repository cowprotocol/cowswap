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
 * False for anything that is not a Solana address at all. `useWalletInfo` reports the chain id and the
 * account from separate sources, so a wallet switch or a page restore leaves an EVM account paired with
 * a Solana chain id for a render or two, and `isOnCurve` throws `Non-base58 character` on it — inside
 * render, which the error boundary turns into a blank page.
 */
export function getIsSolanaSmartContractWallet(owner: PublicKey | string): boolean {
  try {
    return !PublicKey.isOnCurve(owner)
  } catch {
    return false
  }
}

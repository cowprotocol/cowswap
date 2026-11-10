import { useSolanaWalletName } from '@cowprotocol/wallet'

/*
 * Ledger Live's WalletConnect handler rejects a transaction whose fee payer is not the connected
 * account ("Sender does not match transaction fee payer") before it ever reaches the device: the
 * same Ledger account signs the same sponsored transaction when it is imported into Phantom, and
 * Ledger documents no such restriction on `solana_signTransaction`. Matched on the session peer
 * name, so a Ledger used through another wallet keeps sponsorship.
 */
const WALLET_NAMES_REJECTING_FOREIGN_FEE_PAYER = ['ledger'] as const

/**
 * Whether the connected Solana wallet will sign a transaction someone else pays the fee for.
 * True while the wallet is unknown, which keeps sponsorship on for every wallet but the known-bad ones.
 */
export function useWalletAcceptsForeignFeePayer(): boolean {
  const walletName = useSolanaWalletName()?.toLowerCase()

  if (!walletName) return true

  return !WALLET_NAMES_REJECTING_FOREIGN_FEE_PAYER.some((name) => walletName.includes(name))
}

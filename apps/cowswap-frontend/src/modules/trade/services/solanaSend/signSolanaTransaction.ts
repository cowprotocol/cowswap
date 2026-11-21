import { VersionedTransaction } from '@solana/web3.js'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/**
 * Signs without submitting and returns the wire bytes as base64. The sponsor's signature slot travels
 * zeroed — the back end fills it when it countersigns as fee payer.
 */
export async function signSolanaTransaction(
  provider: SolanaProvider,
  transaction: VersionedTransaction,
): Promise<string> {
  const signed = await provider.signTransaction(transaction)

  return Buffer.from(signed.serialize()).toString('base64')
}

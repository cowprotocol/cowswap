import { Transaction } from '@solana/web3.js'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/**
 * Signs without submitting and returns the wire bytes as base64. `requireAllSignatures: false` because
 * the sponsor's signature slot stays empty until the back end fills it — the default would throw on it.
 */
export async function signSolanaTransaction(provider: SolanaProvider, transaction: Transaction): Promise<string> {
  const signed = await provider.signTransaction(transaction)

  return signed.serialize({ requireAllSignatures: false }).toString('base64')
}

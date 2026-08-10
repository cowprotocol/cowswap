import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/** A wallet's own signing confirmation can fail on an expired blockhash if the owner takes a while to
 * approve — refetching and retrying is the standard mitigation, not a sign of a broken transaction. */
const MAX_SEND_ATTEMPTS = 3

/**
 * Packs `instructions` into a complete transaction and sends it via the Solana wallet provider, retrying
 * on an expired blockhash. Shared by the Solana wrap/unwrap and approve flows.
 *
 * A blockhash is fetched right before each attempt rather than once up front: the provider's signing UI
 * runs between our fetch and the user's approval, and a slow approval can carry the transaction past the
 * blockhash's ~60-90s validity window. The wallet provider populates neither the blockhash nor the fee
 * payer, so the transaction is completed here. Anything other than that expiry failure is rethrown as-is.
 */
export async function sendSolanaTransaction(
  connection: Connection,
  provider: SolanaProvider,
  owner: PublicKey,
  instructions: TransactionInstruction[],
  attemptsLeft = MAX_SEND_ATTEMPTS,
): Promise<{ hash: string; lastValidBlockHeight: number }> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const transaction = new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(...instructions)

  try {
    const hash = await provider.sendTransaction(transaction, connection)

    return { hash, lastValidBlockHeight }
  } catch (error) {
    if (attemptsLeft <= 1 || !isBlockhashExpiredError(error)) throw error

    return sendSolanaTransaction(connection, provider, owner, instructions, attemptsLeft - 1)
  }
}

function isBlockhashExpiredError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)

  return /blockhash not found/i.test(message) || /block ?height exceeded/i.test(message)
}

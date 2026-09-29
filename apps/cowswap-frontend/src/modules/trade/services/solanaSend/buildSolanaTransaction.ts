import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

export interface BuildSolanaTransactionParams {
  connection: Connection
  instructions: TransactionInstruction[]
  /** The connected owner for a self-paid transaction; for a sponsored order the funder, who never signs here. */
  feePayer: PublicKey
}

export interface BuiltSolanaTransaction {
  transaction: Transaction
  /** The block height past which the transaction can no longer be included. */
  lastValidBlockHeight: number
}

/**
 * Packs `instructions` into a transaction ready to be signed; wallet providers populate neither the
 * blockhash nor the fee payer. Fetched per call, never reused: a blockhash lives ~60-90s and callers
 * spend an unpredictable part of that waiting on the user to approve.
 */
export async function buildSolanaTransaction({
  connection,
  instructions,
  feePayer,
}: BuildSolanaTransactionParams): Promise<BuiltSolanaTransaction> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const transaction = new Transaction({ feePayer, blockhash, lastValidBlockHeight }).add(...instructions)

  return { transaction, lastValidBlockHeight }
}

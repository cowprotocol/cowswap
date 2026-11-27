import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'

export interface BuildSolanaTransactionParams {
  connection: Connection
  instructions: TransactionInstruction[]
  /** The connected owner for a self-paid transaction; for a sponsored order the funder, who never signs here. */
  feePayer: PublicKey
}

export interface BuiltSolanaTransaction {
  transaction: VersionedTransaction
  /** The block height past which the transaction can no longer be included. */
  lastValidBlockHeight: number
  blockhash: string
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

  // v0 rather than legacy: Trust Wallet's in-app browser re-inflates whatever it is handed through
  // `VersionedTransaction.deserialize`, then calls the legacy-only `serializeMessage()` on the result
  // when the message reads as legacy (trust-web3-provider `MobileAdapter.legacySign`), which throws.
  // Compiled without address lookup tables: the order book rejects a creation transaction using them.
  const message = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message()

  return { transaction: new VersionedTransaction(message), lastValidBlockHeight, blockhash }
}

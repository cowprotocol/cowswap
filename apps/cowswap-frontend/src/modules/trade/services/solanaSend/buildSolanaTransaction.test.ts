/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { Connection, PublicKey, TransactionInstruction, TransactionMessage } from '@solana/web3.js'

import { buildSolanaTransaction } from './buildSolanaTransaction'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const SPONSOR = new PublicKey('So11111111111111111111111111111111111111112')
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'
const LAST_VALID_BLOCK_HEIGHT = 1_234

function createConnection(): Connection {
  return {
    getLatestBlockhash: jest
      .fn()
      .mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT }),
  } as unknown as Connection
}

function dummyInstruction(): TransactionInstruction {
  return new TransactionInstruction({ keys: [], programId: OWNER, data: Buffer.from([]) })
}

describe('buildSolanaTransaction', () => {
  it('keeps the instructions in the order they were given', async () => {
    const [ixA, ixB, ixC] = [dummyInstruction(), dummyInstruction(), dummyInstruction()]

    const { transaction } = await buildSolanaTransaction({
      connection: createConnection(),
      instructions: [ixA, ixB, ixC],
      feePayer: OWNER,
    })

    expect(TransactionMessage.decompile(transaction.message).instructions).toEqual([ixA, ixB, ixC])
  })

  it('completes the transaction with the fetched blockhash', async () => {
    const { transaction, lastValidBlockHeight } = await buildSolanaTransaction({
      connection: createConnection(),
      instructions: [dummyInstruction()],
      feePayer: OWNER,
    })

    expect(transaction.message.recentBlockhash).toBe(BLOCKHASH)
    expect(lastValidBlockHeight).toBe(LAST_VALID_BLOCK_HEIGHT)
  })

  // A sponsored order names a fee payer that never signs locally, so the fee payer has to be free to
  // differ from the connected owner rather than being derived from it.
  it('names whichever fee payer it is given', async () => {
    const { transaction } = await buildSolanaTransaction({
      connection: createConnection(),
      instructions: [dummyInstruction()],
      feePayer: SPONSOR,
    })

    expect(TransactionMessage.decompile(transaction.message).payerKey).toEqual(SPONSOR)
  })

  // Trust Wallet's in-app browser breaks on a legacy message: it deserializes every transaction as
  // versioned, then calls the legacy-only `serializeMessage()` on it.
  it('compiles a versioned message without lookup tables', async () => {
    const { transaction } = await buildSolanaTransaction({
      connection: createConnection(),
      instructions: [dummyInstruction()],
      feePayer: SPONSOR,
    })

    expect(transaction.message.version).toBe(0)
    expect(transaction.message.addressTableLookups).toEqual([])
  })
})

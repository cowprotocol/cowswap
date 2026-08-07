/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import { sendSolanaFlow, SolanaFlowContext } from './sendSolanaFlow'
import { SolanaFlowStep } from './types'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const SIGNATURE = '5x8VXqZ8pQ2mJ7Yb1kL3nR4tW6uH9dF2sG5cA7eB1vN3mK4pQ8rT2yU6iO9aS1dF'
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'
const LAST_VALID_BLOCK_HEIGHT = 1_234

interface Harness {
  context: SolanaFlowContext
  sentTransactions: Transaction[]
  addTransaction: jest.Mock
}

function createHarness(): Harness {
  const sentTransactions: Transaction[] = []

  const connection = {
    getLatestBlockhash: jest
      .fn()
      .mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT }),
  } as unknown as Connection

  const provider = {
    sendTransaction: jest.fn(async (transaction: Transaction) => {
      sentTransactions.push(transaction)

      return SIGNATURE
    }),
  } as unknown as SolanaProvider

  const addTransaction = jest.fn()

  return { context: { connection, provider, owner: OWNER, addTransaction }, sentTransactions, addTransaction }
}

function dummyInstruction(): TransactionInstruction {
  return new TransactionInstruction({ keys: [], programId: OWNER, data: Buffer.from([]) })
}

function step(instructions: TransactionInstruction[], summary: string): SolanaFlowStep {
  return { instructions, summary }
}

describe('sendSolanaFlow', () => {
  it('throws when given no steps', async () => {
    const { context } = createHarness()

    await expect(sendSolanaFlow(context, [])).rejects.toThrow('sendSolanaFlow: no steps to send')
  })

  it("flattens every step's instructions into a single transaction, in order", async () => {
    const { context, sentTransactions } = createHarness()
    const [ixA, ixB, ixC] = [dummyInstruction(), dummyInstruction(), dummyInstruction()]

    await sendSolanaFlow(context, [step([ixA, ixB], 'Wrap 1 SOL'), step([ixC], 'Approve WSOL')])

    expect(sentTransactions[0].instructions).toEqual([ixA, ixB, ixC])
  })

  it('records one transaction joining every step summary', async () => {
    const { context, addTransaction } = createHarness()

    await sendSolanaFlow(context, [
      step([dummyInstruction()], 'Wrap 1 SOL'),
      step([dummyInstruction()], 'Approve WSOL'),
    ])

    expect(addTransaction).toHaveBeenCalledWith({
      hash: SIGNATURE,
      summary: 'Wrap 1 SOL, Approve WSOL',
      data: { lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT },
    })
  })

  it('returns the transaction hash', async () => {
    const { context } = createHarness()

    const result = await sendSolanaFlow(context, [step([dummyInstruction()], 'Wrap 1 SOL')])

    expect(result).toEqual({ hash: SIGNATURE })
  })
})
